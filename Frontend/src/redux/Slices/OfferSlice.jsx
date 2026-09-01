import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const URL = `${API_BASE_URL}/offers`;

export const fetchOffersByApplication = createAsyncThunk(
  "offer/byApplication",
  async (applicationId) => {
    const res = await axios.get(`${URL}/application/${applicationId}`);
    return { applicationId, offers: res.data };
  }
);

export const createOffer = createAsyncThunk("offer/create", async (data) => {
  const res = await axios.post(URL, data);
  return res.data.offer;
});

export const sendOffer = createAsyncThunk("offer/send", async (id) => {
  const res = await axios.patch(`${URL}/${id}/send`);
  return res.data.offer;
});

export const respondOffer = createAsyncThunk(
  "offer/respond",
  async ({ id, status, by }) => {
    const res = await axios.patch(`${URL}/${id}/respond`, { status, by });
    return res.data.offer;
  }
);

export const deleteOffer = createAsyncThunk("offer/delete", async ({ id }) => {
  await axios.delete(`${URL}/${id}`);
  return id;
});

const initialState = {
  byApplication: {}, // applicationId -> [offers]
  loading: false,
  error: null,
};

function upsert(state, offer) {
  if (!offer) return;
  const list = state.byApplication[offer.applicationId] || [];
  const i = list.findIndex((o) => o._id === offer._id);
  if (i !== -1) list[i] = offer;
  else list.unshift(offer);
  state.byApplication[offer.applicationId] = list;
}

const OfferSlice = createSlice({
  name: "offer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOffersByApplication.fulfilled, (state, action) => {
        state.byApplication[action.payload.applicationId] = action.payload.offers;
      })
      .addCase(createOffer.fulfilled, (state, action) => {
        upsert(state, action.payload);
      })
      .addCase(sendOffer.fulfilled, (state, action) => {
        upsert(state, action.payload);
      })
      .addCase(respondOffer.fulfilled, (state, action) => {
        upsert(state, action.payload);
      })
      .addCase(deleteOffer.fulfilled, (state, action) => {
        Object.keys(state.byApplication).forEach((k) => {
          state.byApplication[k] = state.byApplication[k].filter(
            (o) => o._id !== action.payload
          );
        });
      });
  },
});

export default OfferSlice.reducer;
