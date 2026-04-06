import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import departmentRouter from './routes/department.js';
import employeeRouter from './routes/employee.js';
import salaryRouter from './routes/salary.js';
import leaveRouter from './routes/leave.js';
import settingRouter from './routes/setting.js';    
import adminRouter from './routes/admin.js';  
import empRouter from './routes/empsummary.js';
import aiRoutes from './routes/ai.js';
import connecttoDatabase from './db/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
connecttoDatabase()
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));
app.use('/api/auth', authRouter);
app.use('/api/department', departmentRouter);
app.use('/api/employees', employeeRouter);
app.use('/api/salaries', salaryRouter);
app.use('/api/leaves', leaveRouter);
app.use('/api/setting', settingRouter);
app.use('/api/admin', adminRouter);
app.use('/api/employee',empRouter);
app.use('/api/ai', aiRoutes);



app.listen (process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})