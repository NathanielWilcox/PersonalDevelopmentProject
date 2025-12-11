import { expect } from 'chai';
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import { verifyToken, verifyRoles } from '../../utils/authMiddleware.js';
import { AuthenticationError, AuthorizationError } from '../../utils/errorHandling.js';

describe('Auth Middleware', () => {
    describe('verifyToken', () => {
        it('should attach decoded user to req.user on valid token', (done) => {
            const token = jwt.sign(
                { id: 1, username: 'test', role: 'user' },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            const req = {
                headers: {
                    authorization: `Bearer ${token}`
                }
            };
            const res = {};
            const next = sinon.spy();

            verifyToken(req, res, next);

            expect(req.user).to.exist;
            expect(req.user.id).to.equal(1);
            expect(req.user.username).to.equal('test');
            expect(next.called).to.be.true;
            done();
        });

        it('should throw AuthenticationError if no authorization header', (done) => {
            const req = { headers: {} };
            const res = {};
            const next = sinon.spy();

            verifyToken(req, res, next);

            setTimeout(() => {
                const error = next.getCall(0).args[0];
                expect(error).to.be.instanceof(AuthenticationError);
                done();
            }, 10);
        });

        it('should throw AuthenticationError if token is malformed', (done) => {
            const req = {
                headers: {
                    authorization: 'Bearer invalid_token'
                }
            };
            const res = {};
            const next = sinon.spy();

            verifyToken(req, res, next);

            setTimeout(() => {
                const error = next.getCall(0).args[0];
                expect(error).to.be.instanceof(AuthenticationError);
                done();
            }, 10);
        });

        it('should throw AuthenticationError if Bearer prefix missing', (done) => {
            const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET);
            const req = {
                headers: {
                    authorization: token // Missing "Bearer " prefix
                }
            };
            const res = {};
            const next = sinon.spy();

            verifyToken(req, res, next);

            setTimeout(() => {
                const error = next.getCall(0).args[0];
                expect(error).to.be.instanceof(AuthenticationError);
                done();
            }, 10);
        });
    });

    describe('verifyRoles', () => {
        it('should allow user with matching role', (done) => {
            const req = {
                user: {
                    id: 1,
                    role: 'admin'
                }
            };
            const res = {};
            const next = sinon.spy();

            const middleware = verifyRoles(['admin']);
            middleware(req, res, next);

            expect(next.called).to.be.true;
            expect(next.getCall(0).args.length).to.equal(0);
            done();
        });

        it('should reject user with non-matching role', (done) => {
            const req = {
                user: {
                    id: 1,
                    role: 'user'
                }
            };
            const res = {};
            const next = sinon.spy();

            const middleware = verifyRoles(['admin']);
            middleware(req, res, next);

            setTimeout(() => {
                const error = next.getCall(0).args[0];
                expect(error).to.be.instanceof(AuthorizationError);
                done();
            }, 10);
        });

        it('should allow multiple roles', (done) => {
            const req = {
                user: {
                    id: 1,
                    role: 'photographer'
                }
            };
            const res = {};
            const next = sinon.spy();

            const middleware = verifyRoles(['admin', 'photographer', 'user']);
            middleware(req, res, next);

            expect(next.called).to.be.true;
            done();
        });

        it('should throw AuthenticationError if user not authenticated', (done) => {
            const req = {}; // No user property
            const res = {};
            const next = sinon.spy();

            const middleware = verifyRoles(['admin']);
            middleware(req, res, next);

            setTimeout(() => {
                const error = next.getCall(0).args[0];
                expect(error).to.be.instanceof(AuthenticationError);
                done();
            }, 10);
        });
    });
});
