// Lògica de negoci del panell d'administració
// Cap dependència d'Express — només models i tipus

import type {
  AdminStats,
  AdminUserList,
  AdminUserSummary,
  AdminSecurityEvent,
} from "@sequence-arasaac/shared-types";
import type { AppError } from "../../middleware/errorHandler";
import { UserModel } from "../auth/model";
import type { IUser } from "../auth/model";
import { DocumentModel } from "../documents/model";
import { SecurityEventModel } from "../security/model";
import type { UpdateUserInput, ListUsersQuery } from "./validators";

const DAY_MS = 24 * 60 * 60 * 1000;

// Converteix un usuari al resum que veu el panell.
// Deixa fora deliberadament passwordHash, settings i wordProfiles: el panell
// serveix per moderar comptes, no per llegir el contingut de ningú.
const toUserSummary = (user: IUser): AdminUserSummary => ({
  id: String(user._id),
  email: user.email,
  status: user.status,
  role: user.role,
  emailVerified: user.emailVerified,
  tier: user.tier,
  usage: user.usage,
  quotaOverride: user.quotaOverride,
  createdAt: user.createdAt.toISOString(),
  lastLoginAt: user.lastLoginAt?.toISOString(),
});

// Xifres de capçalera. Les consultes van en paral·lel: són independents entre elles.
export const getStats = async (): Promise<AdminStats> => {
  const now = Date.now();
  const last7Days = new Date(now - 7 * DAY_MS);
  const last30Days = new Date(now - 30 * DAY_MS);

  const [
    totalUsers,
    newUsersLast7Days,
    newUsersLast30Days,
    pendingVerification,
    suspendedUsers,
    totalDocuments,
    storageAggregate,
  ] = await Promise.all([
    UserModel.countDocuments(),
    UserModel.countDocuments({ createdAt: { $gte: last7Days } }),
    UserModel.countDocuments({ createdAt: { $gte: last30Days } }),
    UserModel.countDocuments({ emailVerified: false }),
    UserModel.countDocuments({ status: "suspended" }),
    DocumentModel.countDocuments(),
    UserModel.aggregate<{ total: number }>([
      { $group: { _id: null, total: { $sum: "$usage.storageBytes" } } },
    ]),
  ]);

  return {
    totalUsers,
    newUsersLast7Days,
    newUsersLast30Days,
    pendingVerification,
    suspendedUsers,
    totalDocuments,
    totalStorageBytes: storageAggregate[0]?.total ?? 0,
  };
};

// Llistat paginat d'usuaris, amb filtre d'estat i cerca per correu
export const listUsers = async (
  query: ListUsersQuery
): Promise<AdminUserList> => {
  const { page, pageSize, status, search } = query;

  const filter: Record<string, unknown> = {};

  if (status) {
    filter.status = status;
  }

  if (search) {
    // La cerca va contra emailCanonical perquè trobi el compte tant si
    // s'escriu amb punts com amb un alias de "+".
    // Els metacaràcters s'escapen: sense això, un "." cercaria qualsevol lletra
    // i un usuari podria ser trobat per una cerca que no li correspon.
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.emailCanonical = { $regex: escaped, $options: "i" };
  }

  const [users, total] = await Promise.all([
    UserModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    UserModel.countDocuments(filter),
  ]);

  return {
    users: users.map(toUserSummary),
    total,
    page,
    pageSize,
  };
};

// Modifica l'estat o la quota d'un usuari.
// Suspendre incrementa tokenVersion: sense això, els refresh tokens ja emesos
// seguirien renovant la sessió fins a set dies després de la suspensió.
export const updateUser = async (
  userId: string,
  input: UpdateUserInput
): Promise<AdminUserSummary> => {
  const user = await UserModel.findById(userId);

  if (!user) {
    const error = new Error("USER_NOT_FOUND") as AppError;
    error.statusCode = 404;
    error.errorCode = "USER_NOT_FOUND";
    throw error;
  }

  if (input.status !== undefined && input.status !== user.status) {
    user.status = input.status;
    if (input.status === "suspended") {
      user.tokenVersion += 1;
    }
  }

  if (input.quotaOverride !== undefined) {
    user.quotaOverride = input.quotaOverride;
  }

  await user.save();

  return toUserSummary(user);
};

// Esdeveniments de seguretat, filtrables per correu o per origen.
// Serveix per respondre "quants comptes venen d'aquesta mateixa IP".
export const listSecurityEvents = async (filters: {
  emailCanonical?: string;
  ipHash?: string;
  limit: number;
}): Promise<AdminSecurityEvent[]> => {
  const filter: Record<string, unknown> = {};

  if (filters.emailCanonical) {
    filter.emailCanonical = filters.emailCanonical;
  }
  if (filters.ipHash) {
    filter.ipHash = filters.ipHash;
  }

  const events = await SecurityEventModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(filters.limit)
    .lean();

  return events.map((event) => ({
    id: String(event._id),
    type: event.type,
    emailCanonical: event.emailCanonical,
    ipHash: event.ipHash,
    detail: event.detail,
    createdAt: event.createdAt.toISOString(),
  }));
};
