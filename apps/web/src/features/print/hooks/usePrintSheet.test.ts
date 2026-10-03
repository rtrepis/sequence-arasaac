import { afterEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  mountPrintSheet,
  unmountPrintSheet,
  usePrintSheet,
  PRINTING_BODY_CLASS,
  PRINT_ROOT_ID,
} from "./usePrintSheet";

/** Un full com el de la pàgina de vista: mida real i l'escala de pantalla. */
const givenASheet = (text = "casa") => {
  const sheet = document.createElement("div");
  sheet.className = "preview-content";
  sheet.style.transform = "scale(0.72)";
  sheet.innerHTML = `<p>${text}</p>`;
  document.body.appendChild(sheet);
  return sheet;
};

const printRoot = () => document.getElementById(PRINT_ROOT_ID);

afterEach(() => {
  unmountPrintSheet();
  document.body.replaceChildren();
});

describe("mountPrintSheet", () => {
  it("hauria de penjar una còpia del full del body", () => {
    givenASheet("esmorzar");

    mountPrintSheet();

    expect(printRoot()?.parentElement).toBe(document.body);
    expect(printRoot()?.textContent).toBe("esmorzar");
  });

  it("hauria de treure a la còpia l'escala, que només serveix per a la pantalla", () => {
    givenASheet();

    mountPrintSheet();

    const clone = printRoot()?.firstElementChild as HTMLElement;
    expect(clone.style.transform).toBe("none");
  });

  it("no hauria de tocar el full de la pantalla", () => {
    const sheet = givenASheet();

    mountPrintSheet();

    expect(sheet.style.transform).toBe("scale(0.72)");
  });

  it("hauria de marcar el body perquè el CSS sàpiga que només s'imprimeix el full", () => {
    givenASheet();

    mountPrintSheet();

    expect(document.body).toHaveClass(PRINTING_BODY_CLASS);
  });

  it("hauria de poder-se cridar dues vegades sense duplicar el full", () => {
    givenASheet();

    mountPrintSheet();
    mountPrintSheet();

    expect(printRoot()?.children).toHaveLength(1);
  });

  it("no hauria d'amagar res si no hi ha cap full: val més imprimir la pàgina que un paper en blanc", () => {
    mountPrintSheet();

    expect(document.body).not.toHaveClass(PRINTING_BODY_CLASS);
    expect(printRoot()?.children ?? []).toHaveLength(0);
  });
});

describe("unmountPrintSheet", () => {
  it("hauria de deixar la pàgina com estava", () => {
    givenASheet();
    mountPrintSheet();

    unmountPrintSheet();

    expect(document.body).not.toHaveClass(PRINTING_BODY_CLASS);
    expect(printRoot()?.children).toHaveLength(0);
  });
});

describe("usePrintSheet", () => {
  it("hauria de preparar el full quan el navegador avisa que s'imprimeix (Ctrl+P)", () => {
    givenASheet("tren");
    renderHook(() => usePrintSheet());

    window.dispatchEvent(new Event("beforeprint"));

    expect(printRoot()?.textContent).toBe("tren");
    expect(document.body).toHaveClass(PRINTING_BODY_CLASS);
  });

  it("hauria de recollir-lo quan la impressió s'acaba", () => {
    givenASheet();
    renderHook(() => usePrintSheet());
    window.dispatchEvent(new Event("beforeprint"));

    window.dispatchEvent(new Event("afterprint"));

    expect(document.body).not.toHaveClass(PRINTING_BODY_CLASS);
  });

  it("hauria de deixar-ho tot net en desmuntar-se", () => {
    givenASheet();
    const { unmount } = renderHook(() => usePrintSheet());
    window.dispatchEvent(new Event("beforeprint"));

    unmount();

    expect(document.body).not.toHaveClass(PRINTING_BODY_CLASS);
    expect(printRoot()?.children).toHaveLength(0);
  });
});
