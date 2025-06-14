import GraphQLJSON from 'graphql-type-json';

export const scalarResolvers = {
  JSON: GraphQLJSON,
  // Upload: GraphQLUpload, // Temporarily removed until we set up proper file upload
};
