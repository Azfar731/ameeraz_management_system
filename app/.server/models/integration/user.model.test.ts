import { create_client_fn } from "../client.model"



describe('Client', () => {
    it('should create a client',async () => {
        const client = await create_client_fn({
            client_fname: "Azfar",
            client_lname: "Razzaq",
            client_area: "Wafaqi",
            client_mobile_num: "03134549126"
        })
        expect(client).toBeDefined();
    })
})