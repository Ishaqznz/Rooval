export interface GraphQLQuery {
  query: string;
  variables?: Record<string, any>;
}
