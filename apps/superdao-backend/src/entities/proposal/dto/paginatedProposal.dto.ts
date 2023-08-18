import { ObjectType } from '@nestjs/graphql';
import PaginatedResponse from 'src/gql/pagination';
import { Proposal } from 'src/entities/proposal/proposal.model';

@ObjectType()
export class AllProposalsResponse extends PaginatedResponse(Proposal) {}
