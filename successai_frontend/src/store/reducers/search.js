
import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    total: 0,
    selectedRows: [],
    leads: [],
    companies: [],
    filter: {},
    companyFilter: {},
    companiesTotal: 0,
    alignment: "People",
    shouldTrigger: false,
    infinityToasterId: null,
};

const search = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSeachData: (state, action) =>  {
      state.total = action.payload.total;
      state.selectedRows = action.payload.selectedRows;
      state.leads = action.payload.leads;
      state.companies = action.payload.companies;
      state.filter = action.payload.filter;
      state.companyFilter = action.payload.companyFilter;
      state.companiesTotal = action.payload.companiesTotal;
      state.searchReftch = action.payload.searchReftch;
      state.alignment = action.payload.alignment;
      state.shouldTrigger = action.payload.shouldTrigger;
      state.infinityToasterId = action.payload.infinityToasterId;
    }
  }
});

export default search.reducer;

export const { setSeachData } = search.actions;
