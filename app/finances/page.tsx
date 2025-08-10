import Highcharts from 'highcharts'
import highchartsAccessibility from "highcharts/modules/accessibility";
import HighchartsReact from 'highcharts-react-official'
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';

import CssBaseline from '@mui/material/CssBaseline';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles';
import theme from '../../components/theme';

if (typeof window !== `undefined`) {
    highchartsAccessibility(Highcharts);
}

function FinancePage() {
  return (
    <Stack style={{padding: "1px"}} spacing={2} direction="row">
      <label>
        CategoryOrder: 
      </label>
    </Stack>
  );
}

export default function Styled() {
  return (<CssVarsProvider theme={theme}>
    <CssBaseline />
    <Box mx="4rex" mt="1ex" >
      <FinancePage  />
    </Box>
  </CssVarsProvider>);
}
