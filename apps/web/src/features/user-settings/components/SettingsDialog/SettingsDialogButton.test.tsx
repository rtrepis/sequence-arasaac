import { describe, expect, it } from "vitest";
import {
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
  act,
} from "@/test/renderWithProviders";
import { createAppStore } from "@app/store";
import SettingsDialogButton from "./SettingsDialogButton";

describe("SettingsDialogButton", () => {
  it("hauria de mostrar el botó de configuració", () => {
    renderWithProviders(<SettingsDialogButton />);

    expect(
      screen.getByRole("button", { name: "Settings" }),
    ).toBeInTheDocument();
  });

  it("hauria d'obrir el diàleg de configuració en prémer-lo", async () => {
    renderWithProviders(<SettingsDialogButton />);

    await userEvent.click(screen.getByRole("button", { name: "Settings" }));

    expect(
      screen.getByRole("dialog", { name: "Settings" }),
    ).toBeInTheDocument();
  });

  it("hauria de dir amb quin compte s'ha entrat al nom del botó", () => {
    renderWithProviders(<SettingsDialogButton />, {
      preloadedState: {
        auth: {
          accessToken: "token",
          userEmail: "algu@exemple.cat",
          isLoading: false,
          errorCode: null,
          emailVerified: true,
          isAdmin: false,
        },
      },
    });

    expect(
      screen.getByRole("button", {
        name: "Settings · signed in as algu@exemple.cat",
      }),
    ).toBeInTheDocument();
  });

  it("hauria de tornar el focus al botó en tancar el diàleg", async () => {
    renderWithProviders(<SettingsDialogButton />);
    const trigger = screen.getByRole("button", { name: "Settings" });
    await userEvent.click(trigger);

    await userEvent.click(screen.getByRole("button", { name: "close" }));

    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
