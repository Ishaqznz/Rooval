import { Catch, HttpStatus } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { BusinessRuleViolationError } from '../../../core/errors/businessRule.error';
import { NotFoundError } from '../../../core/errors/notFound.error';
import { UnAuthorizedError } from '../../../core/errors/unauthorized.error';

@Catch()
export class GlobalGraphQLExceptionFilter implements GqlExceptionFilter {
  catch(exception: unknown) {
    console.log('Caught exception:', exception);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Internal server error';

    if (exception instanceof BusinessRuleViolationError) {
      status = HttpStatus.BAD_REQUEST;
      code = exception.code;
      message = exception.message;
    } else if (exception instanceof NotFoundError) {
      status = HttpStatus.NOT_FOUND;
      code = exception.code;
      message = exception.message;
    } else if (exception instanceof UnAuthorizedError) {
      status = HttpStatus.UNAUTHORIZED;
      code = exception.code;
      message = exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    console.log('Final formatted message:', message, code);

    return new GraphQLError(message, {
      extensions: {
        code,
        status,
        success: false,
        timestamp: new Date().toISOString(),
      },
    });
  }
}