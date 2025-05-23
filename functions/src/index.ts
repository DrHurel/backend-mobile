/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import {Parcel} from "./entities/parcel";
import {Identification} from "./entities/identification";

// Initialize Firebase once at the top level
admin.initializeApp();

export const saveIdentification = onRequest(async (request, response) => {
  logger.info("saveIdentification", {structuredData: true});
  try {
    const identification = request.body.identification as Identification;
    if (!identification) {
      response.status(400).send("Missing identification");
    }

    const parcelId = identification.parcelId;
    if (!parcelId) {
      response.status(400).send("Missing parcelId");
    }

    const db = admin.firestore();
    const parcelRef = db.collection("parcels").doc(parcelId);
    const doc = await parcelRef.get();

    if (!doc.exists) {
      response.status(404).send("Parcel not found");
    }

    const parcelData = doc.data();
    if (!parcelData) {
      response.status(404).send("Parcel data not found");
      return;
    }

    const identificationData = parcelData.identification || [];
    identificationData.push(identification);

    await parcelRef.update({identification: identificationData});
    response.status(200).send("Identification saved");
  } catch (error) {
    console.error("Error saving identification: ", error);
    response.status(500).send("Error processing request");
  }
});

export const loadParcel = onRequest(async (request, response) => {
  logger.info("loadParcel", {structuredData: true});
  try {
    const {parcelId} = request.body;
    if (!parcelId) {
      response.status(400).send("Missing parcelId");
    }

    const db = admin.firestore();
    const parcelRef = db.collection("parcels").doc(parcelId);
    const doc = await parcelRef.get();

    if (!doc.exists) {
      response.status(404).send("Parcel not found");
    }

    const parcelData = doc.data() as Parcel;
    response.status(200).json(parcelData);
  } catch (error) {
    console.error("Error loading parcel: ", error);
    response.status(500).send("Error processing request");
  }
});

export const createParcel = onRequest(async (request, response) => {
  logger.info("createParcel", {structuredData: true});
  try {
    const parcel = request.body as Parcel;
    if (!parcel.id) {
      response.status(400).send("Missing parcel ID");
    }

    const db = admin.firestore();
    const parcelRef = db.collection("parcels").doc(parcel.id);
    await parcelRef.set(parcel);
    response.status(200).send("Parcel created");
  } catch (error) {
    console.error("Error creating parcel: ", error);
    response.status(500).send("Error processing request");
  }
});

export const updateParcel = onRequest(async (request, response) => {
  logger.info("updateParcel", {structuredData: true});
  try {
    const parcelUpdate = request.body;
    const {parcelId} = request.body;
    if (!parcelId) {
      response.status(400).send("Missing parcelId");
    }

    const db = admin.firestore();
    const parcelRef = db.collection("parcels").doc(parcelId);
    await parcelRef.update(parcelUpdate);
    response.status(200).send("Parcel updated");
  } catch (error) {
    console.error("Error updating parcel: ", error);
    response.status(500).send("Error processing request");
  }
});

export const deleteParcel = onRequest(async (request, response) => {
  logger.info("deleteParcel", {structuredData: true});
  try {
    const {parcelId} = request.body;
    if (!parcelId) {
      response.status(400).send("Missing parcelId");
    }

    const db = admin.firestore();
    const parcelRef = db.collection("parcels").doc(parcelId);
    await parcelRef.delete();
    response.status(200).send("Parcel deleted");
  } catch (error) {
    console.error("Error deleting parcel: ", error);
    response.status(500).send("Error processing request");
  }
});
