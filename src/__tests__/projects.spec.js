const request = require("supertest");
const app = require("../");

const { validate: isUuid } = require("uuid");

describe("Projects", () => {
  it("should be able to create a new repository", async () => {
    const response = await request(app)
      .post("/repositories")
      .send({
        url: "https://github.com/Rocketseat/umbriel",
        title: "Umbriel",
        techs: ["Node", "Express", "TypeScript"]
      });

    expect(isUuid(response.body.id)).toBe(true);

    expect(response.body).toMatchObject({
      url: "https://github.com/Rocketseat/umbriel",
      title: "Umbriel",
      techs: ["Node", "Express", "TypeScript"],
      likes: 0
    });

    const { body: repositoriesList } = await request(app).get("/repositories");

    expect(repositoriesList).toEqual(
      expect.arrayContaining([
        {
          id: response.body.id,
          url: "https://github.com/Rocketseat/umbriel",
          title: "Umbriel",
          techs: ["Node", "Express", "TypeScript"],
          likes: 0
        }
      ])
    );
  });

  it("should be able to list the projects", async () => {
    const repository = await request(app)
      .post("/repositories")
      .send({
        url: "https://github.com/Rocketseat/umbriel",
        title: "Umbriel",
        techs: ["Node", "Express", "TypeScript"]
      });

    const response = await request(app).get("/repositories");

    expect(response.body).toEqual(
      expect.arrayContaining([
        {
          id: repository.body.id,
          url: "https://github.com/Rocketseat/umbriel",
          title: "Umbriel",
          techs: ["Node", "Express", "TypeScript"],
          likes: 0
        }
      ])
    );
  });

  it("should be able to update repository", async () => {
    const repository = await request(app)
      .post("/repositories")
      .send({
        url: "https://github.com/Rocketseat/umbriel",
        title: "Umbriel",
        techs: ["Node", "Express", "TypeScript"]
      });
      
    const response = await request(app)
      .put(`/repositories/${repository.body.id}`)
      .send({
        url: "https://github.com/Rocketseat/unform",
        title: "Unform",
        techs: ["React", "ReactNative", "TypeScript", "ContextApi"]
      });
      
    expect(isUuid(response.body.id)).toBe(true);

    expect(response.body).toMatchObject({
      url: "https://github.com/Rocketseat/unform",
      title: "Unform",
      techs: ["React", "ReactNative", "TypeScript", "ContextApi"]
    });
  });

  it("should not be able to update a non existing repository", async () => {
    await request(app)
      .put(`/repositories/123`)
      .expect(404);
  });

  it("should not be able to update repository likes manually", async () => {
    const repository = await request(app)
      .post("/repositories")
      .send({
        url: "https://github.com/Rocketseat/umbriel",
        title: "Umbriel",
        techs: ["React", "ReactNative", "TypeScript", "ContextApi"]
      });

    const response = await request(app)
      .put(`/repositories/${repository.body.id}`)
      .send({
        likes: 15
      });

    expect(response.body).toMatchObject({
      likes: 0
    });
  });

  it("should be able to delete the repository", async () => {
    const response = await request(app)
      .post("/repositories")
      .send({
        url: "https://github.com/Rocketseat/umbriel",
        title: "Umbriel",
        techs: ["Node", "Express", "TypeScript"]
      });

    await request(app)
      .delete(`/repositories/${response.body.id}`)
      .expect(204);

    const repositories = await request(app).get("/repositories");

    const repository = repositories.body.some(r => r.id === response.body.id);

    expect(repository).toBe(false);
  });

  it("should not be able to delete a non existing repository", async () => {
    await request(app)
      .delete(`/repositories/123`)
      .expect(404);
  });
});
