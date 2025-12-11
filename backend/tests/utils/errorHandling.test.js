import { expect } from 'chai';
import {
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    ResourceNotFoundError,
    ConflictError,
    DatabaseError,
    validateInput
} from '../../utils/errorHandling.js';

describe('Error Handling Utils', () => {
    describe('Custom Error Classes', () => {
        it('should create ValidationError with status code 400', () => {
            const error = new ValidationError('Invalid input', { username: 'Required' });
            expect(error.statusCode).to.equal(400);
            expect(error.name).to.equal('ValidationError');
            expect(error.fields).to.deep.equal({ username: 'Required' });
        });

        it('should create AuthenticationError with status code 401', () => {
            const error = new AuthenticationError('Invalid credentials');
            expect(error.statusCode).to.equal(401);
            expect(error.name).to.equal('AuthenticationError');
        });

        it('should create AuthorizationError with status code 403', () => {
            const error = new AuthorizationError('Access denied');
            expect(error.statusCode).to.equal(403);
            expect(error.name).to.equal('AuthorizationError');
        });

        it('should create ResourceNotFoundError with status code 404', () => {
            const error = new ResourceNotFoundError('User not found');
            expect(error.statusCode).to.equal(404);
            expect(error.name).to.equal('ResourceNotFoundError');
        });

        it('should create ConflictError with status code 409', () => {
            const error = new ConflictError('Username already exists');
            expect(error.statusCode).to.equal(409);
            expect(error.name).to.equal('ConflictError');
        });

        it('should create DatabaseError with status code 500', () => {
            const error = new DatabaseError('DB connection failed');
            expect(error.statusCode).to.equal(500);
            expect(error.name).to.equal('DatabaseError');
        });
    });

    describe('validateInput', () => {
        it('should pass validation for valid input', () => {
            const schema = {
                username: { required: true, pattern: /^[a-zA-Z0-9_]{3,30}$/ }
            };
            const data = { username: 'test_user' };
            expect(() => validateInput(data, schema)).to.not.throw();
        });

        it('should throw ValidationError if required field is missing', () => {
            const schema = {
                username: { required: true }
            };
            const data = {};
            expect(() => validateInput(data, schema)).to.throw(ValidationError);
        });

        it('should throw ValidationError if pattern does not match', () => {
            const schema = {
                username: { pattern: /^[a-z]+$/, message: 'Only lowercase letters' }
            };
            const data = { username: 'Test123' };
            expect(() => validateInput(data, schema)).to.throw(ValidationError);
        });

        it('should throw ValidationError if minLength violated', () => {
            const schema = {
                password: { minLength: 6 }
            };
            const data = { password: '123' };
            expect(() => validateInput(data, schema)).to.throw(ValidationError);
        });

        it('should throw ValidationError if maxLength violated', () => {
            const schema = {
                password: { maxLength: 10 }
            };
            const data = { password: '12345678901' };
            expect(() => validateInput(data, schema)).to.throw(ValidationError);
        });

        it('should throw ValidationError if enum value invalid', () => {
            const schema = {
                role: { enum: ['user', 'admin'] }
            };
            const data = { role: 'superuser' };
            expect(() => validateInput(data, schema)).to.throw(ValidationError);
        });

        it('should include field-level errors in ValidationError', () => {
            const schema = {
                username: { required: true },
                password: { minLength: 6 }
            };
            const data = { password: '123' };
            try {
                validateInput(data, schema);
            } catch (error) {
                expect(error.fields).to.have.property('username');
                expect(error.fields).to.have.property('password');
            }
        });
    });
});
