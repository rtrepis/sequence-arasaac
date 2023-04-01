import { rest } from "msw";

const araSaacURL = process.env.REACT_APP_API_ARASAAC_URL;

export const handlers = [
  rest.get(
    `${araSaacURL}pictograms/en/bestsearch/girl`,
    async (req, res, ctx) => {
      const mockFindPict = [{ _id: 234 }, { _id: 234 }];
      return res(ctx.status(200), ctx.json(mockFindPict));
    }
  ),

  rest.get(
    `${araSaacURL}pictograms/en/bestsearch/asdfas`,
    async (req, res, ctx) => {
      const mockFindPict: any[] = [];
      return res(ctx.status(404), ctx.json(mockFindPict));
    }
  ),

  rest.get(`${araSaacURL}pictograms/en/555`, async (req, res, ctx) => {
    const mockFindPict: {} = { skin: true, tags: ["verb"] };
    return res(ctx.status(200), ctx.json(mockFindPict));
  }),
];
