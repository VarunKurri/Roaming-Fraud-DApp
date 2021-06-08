const _deploy_contracts = require('../migrations/2_deploy_contracts');

const Meme = artifacts.require("Meme");

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Meme', (accounts) => {
    let meme

    before(async () => {
        meme = await Meme.deployed()
    })

    describe('deployment', async () => {
        it('deploys successfully', async () => {
            const address = meme.address
            console.log(address)
            assert.notEqual(address, 0x0)
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })
    })

    describe('storage', async () => {
        it('updates the memeHash', async () => {
            let memeHash = 'Rohan'
            await meme.set(memeHash)
            const result = await meme.get()
            assert.equal(result, memeHash)
        })
    })
})