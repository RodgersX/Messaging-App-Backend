const { buildSchema } = require('graphql')

module.exports = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        password: String!
        status: String!
        posts: [Post!]!
    }

    type AuthData {
        token: String!
        userId: String!
    }

    input userInputData {
        email: String!
        name: String!
        password: String!
    }

    input postInputData {
        title: String!
        content: String!
    }

    type RootQuery {
        login(email: String!, password: String!): AuthData
    }

    type RootMutation {
        createUser(userInput: userInputData): User!
        createPost(postInput: postInputData): Post!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`)