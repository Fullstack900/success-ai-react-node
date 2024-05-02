
import { Requests, SubRequests } from './models/request.model.js'; 
import EmailAnalytics from './models/email-analytics.model.js';
import mongoose from "mongoose";

export async function createRequest(requestData) {
    try {
        const newRequest = await Requests.create(requestData);
        return newRequest;
    } catch (error) {
        throw new Error(`Failed to create request: ${error.message}`);
    }
}

export async function createSubRequest(subRequestData) {
    try {
        const newSubRequest = await SubRequests.create(subRequestData);
        return newSubRequest;
    } catch (error) {
        throw new Error(`Failed to create subrequest: ${error.message}`);
    }
}

export async function getRequestWithSubRequests(requestId) {
    try {
        const request = await Requests.findOne({ _id: requestId }).populate('subRequests');
        return request;
    } catch (error) {
        throw new Error(`Failed to get request with subrequests: ${error.message}`);
    }
}

export async function getSubRequestsForRequest(requestId) {
    try {
        const subRequests = await SubRequests.find({ requestId });
        return subRequests;
    } catch (error) {
        throw new Error(`Failed to get subrequests for request: ${error.message}`);
    }
}

export async function getSubRequestsForBulklookupId(requestId) {
    try {
        const subRequest = await SubRequests.findOne({ bulkLookupId:  requestId}).populate('request');
        return subRequest;
    } catch (error) {
        throw new Error(`Failed to get subrequest for bulkrequest: ${error.message}`);
    }
}

function getResponseTImeInSeconds(createdAt) {
    const createdDate = new Date(createdAt);
    const currentDate = new Date();
    const differenceInMilliseconds = currentDate - createdDate;
    return differenceInMilliseconds / 1000;
  }

export async function updateRequest(requestId, updateData, increaseCredit = false) {
    try {
        let updatedRequestData = updateData;
        updatedRequestData.$inc = { servedRequest: 1 };
        if (increaseCredit) {
            updatedRequestData.$inc = { usedCredits: updateData.usedCredits, servedRequest: 1 };
            delete updatedRequestData.usedCredits;
        }
        let updatedRequest = await Requests.findByIdAndUpdate(requestId, updatedRequestData, { new: true });
        if(updatedRequest?.totalRequest === updatedRequest?.servedRequest){
            updatedRequest = await Requests.findByIdAndUpdate(requestId, {status: "Completed", responseTime: getResponseTImeInSeconds(updatedRequest?.createdAt)});
        }
        return updatedRequest;
    } catch (error) {
        throw new Error(`Failed to update request: ${error.message}`);
    }
}

export async function updateSubRequest(subRequestId, updateData) {
    try {
        const updatedSubRequest = await SubRequests.findByIdAndUpdate(subRequestId, updateData, { new: true });
        return updatedSubRequest;
    } catch (error) {
        throw new Error(`Failed to update subrequest: ${error.message}`);
    }
}

export async function getAllRequests(data) {
    const { sortBy = "createdAt", limit = 15, page, order = "asc", start, end, search, id } = data || {};
    let query = {};

    const startDate = new Date(parseInt(start));
    const endDate = new Date(parseInt(end));

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    let dateFilter = {};
    if (start && end) {
        dateFilter = {
            "createdAt": {
                $gte: startDate,
                $lte: endDate,
            },
        };
    }

    if(id){
        query = {
            "user": new mongoose.Types.ObjectId(id),
        };
    }

    if (search && search.length > 0) {
        query.$or = [
            { "userDetails.email": new RegExp(search?.replace(/[^a-zA-Z0-9]/g, "\\$&"), "i") },
            { "userDetails.name.first": new RegExp(search?.replace(/[^a-zA-Z0-9]/g, "\\$&"), "i") },
            { "userDetails.name.last": new RegExp(search?.replace(/[^a-zA-Z0-9]/g, "\\$&"), "i") },
        ];
    }

    try {
        const response = await Requests.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            {
                $unwind: {
                    path: "$userDetails",
                    preserveNullAndEmptyArrays: false,
                },
            },
            {
                $match: {
                    $and: [
                        dateFilter,
                        query
                    ],
                },
            },
            {
                $facet: {
                    paginatedResults: [
                        {
                            $addFields: {
                                user: "$userDetails"
                            }
                        },
                        {
                            $sort: { [sortBy]: order === "asc" ? 1 : -1 },
                        },
                        {
                            $skip: (page - 1) * parseInt(limit),
                        },
                        {
                            $limit: parseInt(limit),
                        },
                        {
                            $project: {
                                user: 1,
                                requestType: 1,
                                status: 1,
                                leadsCount: 1,
                                totalRequest: 1,
                                createdAt: 1,
                                updatedAt: 1,
                                servedRequest: 1,
                                usedCredits: 1,
                                responseTime: 1,
                            },
                        },
                    ],
                    totalCount: [
                        { $count: "value" }
                    ]
                }
            }
        ]);

        const total = response[0].totalCount[0] ? response[0].totalCount[0].value : 0;
        const paginatedResults = response[0].paginatedResults;

        if (total === 0) {
            return {
                total: 0,
                hasNextPage: false,
                data: []
            };
        }

        const totalPages = Math.ceil(total / limit);
        return {
            total,
            hasNextPage: page < totalPages,
            totalPages,
            currentPage: page,
            data: paginatedResults
        };
    } catch (error) {
        throw new Error(`Failed to get all requests: ${error.message}`);
    }
}

export async function addOrUpdateEmailAnalytics(user, count, type) {
    if(!user?._id){
        return;
    }
    const currentDateWithoutTime = new Date();
    currentDateWithoutTime.setHours(0, 0, 0, 0);
    const mailCount = parseInt(count);
    let updatedAnalytics = await EmailAnalytics.findOneAndUpdate(
        {
            user,
            type,
            dateWithoutTime: currentDateWithoutTime,
        },
        { $inc: { count: mailCount } },
        { new: true }
    );
    if (!updatedAnalytics) {
        updatedAnalytics = await EmailAnalytics.create({
            user,
            type,
            count: mailCount,
            dateWithoutTime: currentDateWithoutTime,
        });
    }

    return updatedAnalytics;
}

export async function getAllEmailAnalytics(data) {
    const { sortBy = "createdAt", limit = 15, page, order = "asc", start, end, search, id } = data || {};
    let query = {};

    const startDate = new Date(parseInt(start));
    const endDate = new Date(parseInt(end));

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    let dateFilter = {};
    if (start && end) {
        dateFilter = {
            "createdAt": {
                $gte: startDate,
                $lte: endDate,
            },
        };
    }

    if(id){
        query = {
            "user": new mongoose.Types.ObjectId(id),
        };
    }

    if (search && search.length > 0) {
        query.$or = [
            { "userDetails.email": new RegExp(search?.replace(/[^a-zA-Z0-9]/g, "\\$&"), "i") },
            { "userDetails.name.first": new RegExp(search?.replace(/[^a-zA-Z0-9]/g, "\\$&"), "i") },
            { "userDetails.name.last": new RegExp(search?.replace(/[^a-zA-Z0-9]/g, "\\$&"), "i") },
        ];
    }

    try {
        const response = await EmailAnalytics.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            {
                $unwind: {
                    path: "$userDetails",
                    preserveNullAndEmptyArrays: false,
                },
            },
            {
                $match: {
                    $and: [
                        dateFilter,
                        query
                    ],
                },
            },
            {
                $facet: {
                    paginatedResults: [
                        {
                            $addFields: {
                                user: "$userDetails"
                            }
                        },
                        {
                            $sort: { [sortBy]: order === "asc" ? 1 : -1 },
                        },
                        {
                            $skip: (page - 1) * parseInt(limit),
                        },
                        {
                            $limit: parseInt(limit),
                        },
                        {
                            $project: {
                                user: 1,
                                count: 1,
                                type: 1,
                                dateWithoutTime: 1,
                                createdAt: 1,
                                updatedAt: 1,
                            },
                        },
                    ],
                    totalCount: [
                        { $count: "value" }
                    ]
                }
            }
        ]);

        const total = response[0].totalCount[0] ? response[0].totalCount[0].value : 0;
        const paginatedResults = response[0].paginatedResults;

        if (total === 0) {
            return {
                total: 0,
                hasNextPage: false,
                data: []
            };
        }

        const totalPages = Math.ceil(total / limit);
        return {
            total,
            hasNextPage: page < totalPages,
            totalPages,
            currentPage: page,
            emailAnalytics: paginatedResults
        };
    } catch (error) {
        throw new Error(`Failed to get all requests: ${error.message}`);
    }
}

export async function getEmailAnalyticsChart({ id, start, end, search }) {
    let matchQuery = {};
    if (id) {
        matchQuery.user = new mongoose.Types.ObjectId(id);
    }

    if (start && end) {
        const startDate = new Date(parseInt(start));
        const endDate = new Date(parseInt(end));
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        matchQuery.createdAt = {
            $gte: startDate,
            $lte: endDate,
        };
    }

    if (search && search.length > 0) {
        matchQuery.$or = [
            { "userDetails.email": new RegExp(search?.replace(/[^a-zA-Z0-9]/g, "\\$&"), "i") },
            { "userDetails.name.first": new RegExp(search?.replace(/[^a-zA-Z0-9]/g, "\\$&"), "i") },
            { "userDetails.name.last": new RegExp(search?.replace(/[^a-zA-Z0-9]/g, "\\$&"), "i") },
        ];
    }

    try {
        const response = await EmailAnalytics.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            {
                $unwind: {
                    path: "$userDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $match: matchQuery,
            },
            {
                $sort: { createdAt: -1 },
            },
        ]);

        return response;
    } catch (error) {
        console.error("Error fetching requests data from database:", error);
        throw error;
    }
}

export async function getAllRequestsChart({ id, start, end, search }) {
    let matchQuery = {};
    if (id) {
        matchQuery.user = new mongoose.Types.ObjectId(id);
    }

    if (start && end) {
        const startDate = new Date(parseInt(start));
        const endDate = new Date(parseInt(end));
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        matchQuery.createdAt = {
            $gte: startDate,
            $lte: endDate,
        };
    }

    if (search && search.length > 0) {
        matchQuery.$or = [
            { "userDetails.email": new RegExp(search?.replace(/[^a-zA-Z0-9]/g, "\\$&"), "i") },
            { "userDetails.name.first": new RegExp(search?.replace(/[^a-zA-Z0-9]/g, "\\$&"), "i") },
            { "userDetails.name.last": new RegExp(search?.replace(/[^a-zA-Z0-9]/g, "\\$&"), "i") },
        ];
    }

    try {
        const response = await Requests.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            {
                $unwind: {
                    path: "$userDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $match: matchQuery,
            },
            {
                $sort: { createdAt: -1 },
            },
        ]);

        return response;
    } catch (error) {
        console.error("Error fetching requests data from database:", error);
        throw error;
    }
}
