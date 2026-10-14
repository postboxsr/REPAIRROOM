// Live integrations deliberately have no implementation in this milestone.
export interface VehicleDataAdapter { identify(input:{hsn:string;tsn:string}):Promise<{id:string;oilSpecification:string;litres:number}> }
export interface PaymentAdapter { createCheckout(input:{bookingId:string;amountCents:number;currency:'EUR'}):Promise<{url:string}>; verifyWebhook(body:string,signature:string):Promise<{bookingId:string;paid:boolean}> }
export interface EmailAdapter { sendConfirmation(input:{to:string;bookingId:string;managementUrl:string}):Promise<void> }
