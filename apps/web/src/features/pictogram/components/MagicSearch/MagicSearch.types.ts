export interface MagicSearchProps {
  // Mostra el text d'ajuda complet sota l'input; si és fals, només l'exemple curt
  showHelperText: boolean;
  /**
   * A la barra de baix de l'edició al mòbil (pla dels estils, pas 8): sense
   * text d'ajuda sota el camp, i els suggeriments s'obren cap amunt (D22)
   */
  bottomBar?: boolean;
}
