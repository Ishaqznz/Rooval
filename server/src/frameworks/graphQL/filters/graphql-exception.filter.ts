import { Catch, HttpStatus } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { BusinessRuleViolationError } from 'src/core/errors/business-rule.error';
import { NotFoundError } from 'src/core/errors/not-found.error';
import { UnAuthorizedError } from 'src/core/errors/unauthorized.error';

@Catch()
export class GlobalGraphQLExceptionFilter implements GqlExceptionFilter {
  catch(exception: any) {
    console.log('Caught exception: ', exception);
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
    } else if (exception.message) {
      message = exception.message;
    }

    return {
      success: false,
      message,
      code,
      status,
      timestamp: new Date().toISOString(),
    };
  }
}
