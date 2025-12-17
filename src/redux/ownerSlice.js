import { createSlice } from "@reduxjs/toolkit";

const ownerSlice = createSlice({
    name: "owner",
    initialState: {
        myshopData: null,
    },
    reducers: {
        setmyshopData: (state, action) => {
            state.myshopData = action.payload;
        }
    }
})
export const { setmyshopData } = ownerSlice.actions;
export default ownerSlice.reducer;   