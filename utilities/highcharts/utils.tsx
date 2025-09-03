export function makeCurrencyFormatter(precision) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: precision,
  }).format;
}

// Converts a danfo dataframe into a set of rows for a Highcharts DataTable.
export function danfoToJsonOptions(df: DataFrame, precision: number) {
  const new_df = df.round(precision);
  new_df.addColumn(
    'covid_shape',
    new_df["class_of"].apply((year) => {
      if (year < 2020) {
        return 'triangle-down';
      } else if (year < 2022) {
        return 'square';
      } else {
        return 'triangle';
      }
    }),
    { inplace: true }
  );

  return {
    firstRowAsNames: false,
    columnNames: new_df.columns,
    data: new_df.values,
  };
}

