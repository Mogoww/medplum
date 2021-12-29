import { allOk, LoginState } from '@medplum/core';
import { MockClient } from './client';
import { HomerSimpson } from './mocks';

describe('MockClient', () => {
  test('Simple route', async () => {
    const client = new MockClient();
    const result = await client.get('fhir/R4/Patient/123');
    expect(result).toMatchObject(HomerSimpson);
  });

  test('Profile', () => {
    const client = new MockClient();
    expect(client.getProfile()).toMatchObject({ resourceType: 'Practitioner' });
  });

  test('Login override', () => {
    const client = new MockClient();
    expect(client.getActiveLogin()).toBeUndefined();

    client.setActiveLoginOverride({} as LoginState);
    expect(client.getActiveLogin()).toBeDefined();
  });

  test('Change password', () => {
    const client = new MockClient();
    expect(client.post('auth/changepassword', '{"oldPassword":"orange"}')).resolves.toMatchObject(allOk);
    expect(client.post('auth/changepassword', '{"oldPassword":"banana"}')).rejects.toBeDefined();
  });

  test('Set password', () => {
    const client = new MockClient();
    expect(client.post('auth/setpassword', '{"password":"orange"}')).resolves.toMatchObject(allOk);
    expect(client.post('auth/setpassword', '{"password":"banana"}')).rejects.toBeDefined();
  });

  test('Reset password', () => {
    const client = new MockClient();
    expect(client.post('auth/resetpassword', '{"email":"admin@example.com"}')).resolves.toMatchObject(allOk);
    expect(client.post('auth/resetpassword', '{"email":"other@example.com"}')).rejects.toBeDefined();
  });

  test('Register', () => {
    const client = new MockClient();
    expect(
      client.post('auth/register', JSON.stringify({ email: 'george@example.com', password: 'password' }))
    ).resolves.toMatchObject(allOk);
    expect(
      client.post('auth/register', JSON.stringify({ email: 'other@example.com', password: 'password' }))
    ).rejects.toBeDefined();
    expect(
      client.post('auth/register', JSON.stringify({ email: 'george@example.com', password: 'wrong' }))
    ).rejects.toBeDefined();
  });

  test('Batch request', () => {
    const client = new MockClient();
    expect(
      client.post(
        'fhir/R4',
        JSON.stringify({
          resourceType: 'Bundle',
          entry: [
            {
              request: {
                method: 'GET',
                url: 'Patient/123',
              },
            },
          ],
        })
      )
    ).resolves.toMatchObject({
      resourceType: 'Bundle',
      type: 'batch-response',
      entry: [
        {
          resource: HomerSimpson,
        },
      ],
    });
  });

  test('Debug mode', async () => {
    console.log = jest.fn();
    const client = new MockClient({ debug: true });
    await client.get('not-found');
    expect(console.log).toHaveBeenCalledTimes(2);
  });
});