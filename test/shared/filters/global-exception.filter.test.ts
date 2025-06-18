import { GlobalExceptionFilter } from 'src/shared/filters/global-exception.filter';
import { HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface';
import { HttpException } from '@nestjs/common/exceptions/http.exception';

describe('GlobalExceptionFilter', () => {
  let exceptionFilter: GlobalExceptionFilter;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let mockArgumentsHost: Partial<ArgumentsHost>;

  beforeEach(() => {
    exceptionFilter = new GlobalExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockRequest = {
      method: 'GET',
      url: '/test',
    };
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };
    jest.spyOn(Logger.prototype, 'error').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should handle non-http exception', () => {
    const unknownException = new Error('Unexpected Error');

    exceptionFilter.catch(unknownException, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      timestamp: expect.any(String),
      path: mockRequest.url,
    });
    expect(Logger.prototype.error).toHaveBeenCalledWith(
      `Request GET /test failed: "Internal server error"`,
      unknownException.stack,
    );
  });

  it('should handle http exception with string message', () => {
    const httpException = new HttpException('Not Found', HttpStatus.NOT_FOUND);

    exceptionFilter.catch(httpException, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Not Found',
      timestamp: expect.any(String),
      path: mockRequest.url,
    });
    expect(Logger.prototype.error).toHaveBeenCalledWith(
      `Request GET /test failed: "Not Found"`,
      expect.any(String),
    );
  });

  it('should handle http exception with object message', () => {
    const httpException = new HttpException(
      { message: 'Validation Failed' },
      HttpStatus.BAD_REQUEST,
    );

    exceptionFilter.catch(httpException, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Validation Failed',
      timestamp: expect.any(String),
      path: mockRequest.url,
    });
    expect(Logger.prototype.error).toHaveBeenCalledWith(
      `Request GET /test failed: "Validation Failed"`,
      expect.any(String),
    );
  });

  it('should handle http exception without message', () => {
    const httpException = new HttpException({}, HttpStatus.BAD_REQUEST);

    exceptionFilter.catch(httpException, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Internal server error',
      timestamp: expect.any(String),
      path: mockRequest.url,
    });
    expect(Logger.prototype.error).toHaveBeenCalledWith(
      `Request GET /test failed: "Internal server error"`,
      expect.any(String),
    );
  });
});
