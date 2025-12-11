import { expect } from 'chai';
import request from 'supertest';
import app from '../../index.js';

describe('Authentication Routes', () => {
    // Note: These tests assume a test database is running
    // Set NODE_ENV=test and use test database for isolation

    describe('POST /login', () => {
        it('should return token for valid credentials', (done) => {
            request(app)
                .post('/login')
                .send({
                    username: 'testuser',
                    password: 'testpass123'
                })
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.have.property('token');
                    expect(res.body).to.have.property('id');
                    expect(res.body).to.have.property('username');
                    expect(res.body).to.have.property('role');
                    done();
                });
        });

        it('should return 400 for missing username', (done) => {
            request(app)
                .post('/login')
                .send({
                    password: 'testpass123'
                })
                .expect(400)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body.error).to.have.property('code');
                    done();
                });
        });

        it('should return 400 for missing password', (done) => {
            request(app)
                .post('/login')
                .send({
                    username: 'testuser'
                })
                .expect(400)
                .end(done);
        });

        it('should return 401 for invalid username', (done) => {
            request(app)
                .post('/login')
                .send({
                    username: 'nonexistent',
                    password: 'anypassword'
                })
                .expect(401)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body.error.code).to.equal('AuthenticationError');
                    done();
                });
        });

        it('should return 401 for incorrect password', (done) => {
            request(app)
                .post('/login')
                .send({
                    username: 'testuser',
                    password: 'wrongpassword'
                })
                .expect(401)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body.error.code).to.equal('AuthenticationError');
                    done();
                });
        });
    });

    describe('POST /api/logout', () => {
        it('should logout successfully with valid token', (done) => {
            // First login to get token
            request(app)
                .post('/login')
                .send({
                    username: 'testuser',
                    password: 'testpass123'
                })
                .end((err, res) => {
                    if (err) return done(err);
                    const token = res.body.token;

                    // Then logout
                    request(app)
                        .post('/api/logout')
                        .set('Authorization', `Bearer ${token}`)
                        .expect(200)
                        .end((err, res) => {
                            if (err) return done(err);
                            expect(res.body).to.have.property('message');
                            done();
                        });
                });
        });

        it('should return 401 without token', (done) => {
            request(app)
                .post('/api/logout')
                .expect(401)
                .end(done);
        });
    });

    describe('POST /api/create', () => {
        it('should create new user with valid data', (done) => {
            const uniqueUsername = `testuser_${Date.now()}`;
            request(app)
                .post('/api/create')
                .send({
                    username: uniqueUsername,
                    password: 'password123',
                    email: `${uniqueUsername}@test.com`,
                    role: 'user'
                })
                .expect(201)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.have.property('userId');
                    expect(res.body).to.have.property('message');
                    done();
                });
        });

        it('should return 400 for missing username', (done) => {
            request(app)
                .post('/api/create')
                .send({
                    password: 'password123'
                })
                .expect(400)
                .end(done);
        });

        it('should return 400 for invalid username pattern', (done) => {
            request(app)
                .post('/api/create')
                .send({
                    username: 'ab', // Too short (< 3 chars)
                    password: 'password123'
                })
                .expect(400)
                .end(done);
        });

        it('should return 400 for invalid email format', (done) => {
            request(app)
                .post('/api/create')
                .send({
                    username: 'testuser',
                    password: 'password123',
                    email: 'invalid-email'
                })
                .expect(400)
                .end(done);
        });

        it('should return 409 for duplicate username', (done) => {
            request(app)
                .post('/api/create')
                .send({
                    username: 'testuser', // Existing user
                    password: 'password123'
                })
                .expect(409)
                .end(done);
        });
    });
});
