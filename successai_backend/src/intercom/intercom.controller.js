import * as intercomService from "./intercom.service.js";

export const createIntercomUser = async (data) => {
  const user = await intercomService.createUser(data);
  if (!user) throw new HttpErrors.NotFound("Campaign not found");
  return;
};
export const addIntercomEvent = async (email, event) => {
  const createdEvent = await intercomService.createIntercomEvent(email, event);
  return createdEvent;
};

export const findUserFromIntercom = async (email) => {
  const user = await intercomService.findUserFromIntercom(email);
  if (!user) throw new HttpErrors.NotFound("User not found");
  return user;
};
export const UpdateIntercomEvent = async (req, res) => {
  const IntercomData = await intercomService.UpdateIntercomEvent(
    req.body.user,
    req.body.attribute,
    req.body.value
  );
  if (!IntercomData) throw new HttpErrors.NotFound("Not FOund");
  res.send({ IntercomData });
};
