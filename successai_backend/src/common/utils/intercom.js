import * as intercomService from "../../intercom/intercom.service.js";

export const generateIntercomEvent = async (email, eventName, metadata = {}, userId = null ) =>  {
    const intercomUser = await intercomService.findUserFromIntercom(
        email
    );
    const intercomEvent = {
        eventName: eventName,
        id: intercomUser.id,
        email,
        metadata,
        createdAt: Math.round(Date.now() / 1000),
        ...(userId && { userId })
    };
    // await intercomService.createIntercomEvent(intercomEvent);
    return { intercomUser, intercomEvent }
}