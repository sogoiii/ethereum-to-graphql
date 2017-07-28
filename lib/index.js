const Web3 = require('web3')
const TFcontract = require('truffle-contract')

const { genQueryTypes } = require('./createQLType')
const { genFnLines } = require('./createFnQueryLines')

const genGraphQlProperties = ({ artifacts, provider: { url }, graphql }) => {
  const { buildSchema } = graphql
  const allSchemes = artifacts.map(item => { return { artifact: item, contract: TFcontract(item) } })
                              .map(function({ artifact, contract }) {
                                contract.setProvider(new Web3.providers.HttpProvider(url))
                                const { queryTypes, allResolvers } = genQueryTypes({ artifact, contract })
                                const createFnQueryLines = genFnLines({ artifact })
                                const baseScheme = `
                                  ${queryTypes}
                                  ${createFnQueryLines}
                                `
                                return { baseScheme, resolvers: allResolvers }
                              })

  const allTypes = allSchemes.map(item => item.baseScheme)

  return {
    schema: buildSchema(allSchemes[0].baseScheme),
    rootValue: allSchemes[0].resolvers
  }
}


module.exports = {
  genGraphQlProperties
}
