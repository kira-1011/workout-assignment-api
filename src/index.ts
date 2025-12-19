import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { swaggerSpec, swaggerUi } from "./config/swagger.js";
import errorHandler from "./middleware/error-handler";
import { apiRoutes } from "./routes/index";

const app = express();

// middlewares
app.use(express.json());
app.use(cors());
// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.get("/", (_, res) => {
	res.json({ message: "Workout Assignment API" });
});

app.use("/api", apiRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
	console.log(`Server is running on port ${env.PORT}`);
	console.log(
		`Swagger docs available at http://localhost:${env.PORT}/api-docs`,
	);
});
