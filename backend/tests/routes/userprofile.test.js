import { expect } from 'chai';
import request from 'supertest';
import app from '../../index.js';

describe('User Profile Routes', () => {
    let token;
    let userId;

    before((done) => {
        // Login to get token for subsequent tests
        request(app)
            .post('/login')
            .send({
                username: 'testuser',
                password: 'testpass123'
            })
            .end((err, res) => {
                if (err) return done(err);
                token = res.body.token;
                userId = res.body.id;
                done();
            });
    });

    describe('GET /api/userprofile', () => {
        it('should return user profile with valid token', (done) => {
            request(app)
                .get('/api/userprofile')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.have.property('idusers');
                    expect(res.body).to.have.property('username');
                    expect(res.body).to.have.property('role');
                    done();
                });
        });

        it('should return 401 without token', (done) => {
            request(app)
                .get('/api/userprofile')
                .expect(401)
                .end(done);
        });

        it('should return 401 with invalid token', (done) => {
            request(app)
                .get('/api/userprofile')
                .set('Authorization', 'Bearer invalid_token')
                .expect(401)
                .end(done);
        });

        it('should return 401 with expired token', (done) => {
            const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0ZXN0IiwiaWF0IjoxNjU0NTQ1NzY5LCJleHAiOjE2NTQ1NDU3NzB9.invalid';
            request(app)
                .get('/api/userprofile')
                .set('Authorization', `Bearer ${expiredToken}`)
                .expect(401)
                .end(done);
        });
    });

    describe('PUT /userprofile/:id', () => {
        it('should update own profile with valid data', (done) => {
            request(app)
                .put(`/userprofile/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    username: `updated_user_${Date.now()}`,
                    email: 'newemail@test.com'
                })
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.have.property('message');
                    done();
                });
        });

        it('should return 400 for invalid username pattern', (done) => {
            request(app)
                .put(`/userprofile/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    username: 'a' // Too short
                })
                .expect(400)
                .end(done);
        });

        it('should return 400 for invalid email format', (done) => {
            request(app)
                .put(`/userprofile/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    email: 'invalid-email'
                })
                .expect(400)
                .end(done);
        });

        it('should return 403 when updating other user profile', (done) => {
            request(app)
                .put('/userprofile/999') // Different user ID
                .set('Authorization', `Bearer ${token}`)
                .send({
                    username: 'hacker'
                })
                .expect(403)
                .end(done);
        });

        it('should return 401 without token', (done) => {
            request(app)
                .put(`/userprofile/${userId}`)
                .send({
                    username: 'test'
                })
                .expect(401)
                .end(done);
        });
    });

    describe('DELETE /userprofile/:id', () => {
        it('should return 403 for non-admin user', (done) => {
            request(app)
                .delete(`/userprofile/${userId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(403)
                .end(done);
        });

        it('should return 401 without token', (done) => {
            request(app)
                .delete(`/userprofile/${userId}`)
                .expect(401)
                .end(done);
        });
    });
});
