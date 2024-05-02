import * as warmupService from "./warmUpEmails.service.js"

export async function warmup(req,res) {

    const warmupAccount = await warmupService.fetchWarmupEmails();
    const warmupEmail = await warmupService.warmupAccount(warmupAccount);
    res.send(
        {
            warmupEmail
        }
    )
    
}