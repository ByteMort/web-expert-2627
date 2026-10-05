import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../app';

const PERSONS = [
  {
    "id": 1,
    "name": "Jan"
  },
  {
    "id": 2,
    "name": "Sofie"
  },
  {
    "id": 3,
    "name": "Tim"
  }
];

const PETS = [
  {
    "id": 1,
    "type": "dog",
    "name": "Jimmy",
    "ownerIds": [
      2
    ]
  },
  {
    "id": 2,
    "type": "cat",
    "name": "Duvel",
    "ownerIds": [
      1,
      2
    ]
  }
];

const PETS_WITH_OWNERS = [
  {
    "id": 1,
    "type": "dog",
    "name": "Jimmy",
    "ownerIds": [
      2
    ],
    "owners": [
      {
        "id": 2,
        "name": "Sofie"
      }
    ]
  },
  {
    "id": 2,
    "type": "cat",
    "name": "Duvel",
    "ownerIds": [
      1,
      2
    ],
    "owners": [
      {
        "id": 1,
        "name": "Jan"
      },
      {
        "id": 2,
        "name": "Sofie"
      }
    ]
  }
];

describe("API Get Tests", () => {
    it("Get /persons - should return status 200 and persons", async () => {
        const response = await request(app).get('/persons');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toEqual(PERSONS);
    });

    it("Get /pets - should return status 200 and pets", async () => {
        const response = await request(app).get('/pets');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toEqual(PETS);
    });


    it("Get /persons/:id - should return status 200 and an object", async () => {
        const response = await request(app).get('/persons/1');

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(PERSONS[0].id);
        expect(response.body.name).toBe(PERSONS[0].name);
    });


    it("Get /pets/:id - should return status 200 and an object", async () => {
        const response = await request(app).get('/pets/2');

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(PETS[1].id);
        expect(response.body.type).toBe(PETS[1].type);
        expect(response.body.name).toBe(PETS[1].name);
        expect(Array.isArray(response.body.ownerIds)).toBe(true);
        expect(response.body.ownerIds).toEqual(PETS[1].ownerIds);
    });

    it("Get /pets?embed=owners - should return status 200 and pets with owners", async () => {
        const response = await request(app).get('/pets?embed=owners');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body).toEqual(PETS_WITH_OWNERS);
    });

    it("Get /pets/:id?embed=owners - should return status 200 and pet with owners", async () => {
        const response = await request(app).get('/pets/1?embed=owners');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(PETS_WITH_OWNERS[0]);
    });
});

describe("Other API Requests", () => {
    it("Post /persons/:id - should add new person and return all persons", async () => {
        const body = {
            id: 55,
            name: "Test User" 
        };
        const response = await request(app)
            .post('/persons')
            .send(body)
            .redirects(1);

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(PERSONS.length+1);
        expect(response.body[response.body.length-1]).toEqual(body);
    });

    it("Put /persons/:id - should update person and return all persons", async () => {
        const body = {
            name: "New Name"
        };
        const response = await request(app)
            .put('/persons/55')
            .send(body)
            .redirects(1);

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(PERSONS.length+1);
        expect(response.body[response.body.length-1].name).toBe(body.name);
    });

    it("Delete /persons/:id - should delete person and return all persons", async() => {
        const response = await request(app)
            .delete('/persons/55')
            .redirects(1);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(PERSONS.length);

        const hasUser = response.body.some((item:any) => String(item.id) === String(55));
        expect(hasUser).toBe(false);
    });
});