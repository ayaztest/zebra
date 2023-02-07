import type { NextApiRequest, NextApiResponse } from 'next'
import {google} from "googleapis";

type SheetForm = {
    firstname: string
    lastname: string
    email: string
    country: string
    wallet: string
    nftNames: string[]
    total: string
    selectedOption: string
    streetAddress: string
    totaltwo: string
    nftNamestwo: string[]
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    console.log('Entered the serverless function');

  res.status(200).json({ message: 'Hello from the serverless function' });
    
    if (req.method !== 'POST') {
        return res.status(405).send({ message: 'Only POST requests allowed' })
    } 

    const body = req.body as SheetForm

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
            },
            scopes: [
                'https://www.googleapis.com/auth/drive',
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/spreadsheets'
            ]
        })

        const sheets = google.sheets({
            auth,
            version: 'v4'
        });

        const nftNames = body.nftNames.join(', ')
        const nftNamestwo = body.nftNamestwo.join(', ')
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'A1:K1',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    [body.firstname, body.lastname, body.email,
                        body.streetAddress, body.country, body.wallet,
                        body.total, body.selectedOption, nftNames, body.totaltwo, nftNamestwo]
                ]
            }
        });

        return res.status(201).json({
            data: response.data
        })
    } catch (e: any) {
        if (typeof e.code === 'number' && typeof e.message === 'string') {
            return res.status(e.code).send({ message: e.message });
        }
    }

}