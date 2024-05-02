import * as appsumoService from './appsumo.service.js';

export async function getAccessToken(req, res) {
    const access = await appsumoService.getAccessToken(req.body);
    res.send({ access });
}

export async function licenceUpdate(req, res) {
    const activation = await appsumoService.licenceUpdate(req.user, req.body);
    if(activation?.redirect_url){
        res.status(201).send(activation);
    } 
    else {
        res.send(activation);
    }

}
