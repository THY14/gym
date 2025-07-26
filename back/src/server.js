import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { serveSwagger, setupSwagger } from './config/swagger.js';
import  AuthRoutes  from './routes/auth.routes.js';
import MemberRoutes from './routes/member.routes.js';
import UserRoutes from './routes/user.routes.js';
import MembershipsRoutes from './routes/memberships.routes.js'
import ClassesRoutes from './routes/class.routes.js';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


app.use('/docs',serveSwagger, setupSwagger);

app.use('/auth', AuthRoutes);
app.use('/members', MemberRoutes);
app.use('/users', UserRoutes);
app.use('/memberships', MembershipsRoutes);
app.use('/classes', ClassesRoutes);



// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});



