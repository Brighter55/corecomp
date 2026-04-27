import { createContext, useContext, useMemo } from "react";

const StockHeaderContext = createContext({
  symbol: "",
  logoUrl: "",
});

export function StockHeaderProvider({ symbol = "", logoUrl = "", children }) {
  const value = useMemo(() => ({ symbol, logoUrl }), [symbol, logoUrl]);
  return <StockHeaderContext.Provider value={value}>{children}</StockHeaderContext.Provider>;
}

export function useStockHeader() {
  return useContext(StockHeaderContext);
}
