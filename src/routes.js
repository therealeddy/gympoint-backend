import { Router } from 'express';

import StudentController from './app/controllers/StudentController';
import SessionController from './app/controllers/SessionController';
import PlanController from './app/controllers/PlanController';
import MatriculationController from './app/controllers/MatriculationController';
import CheckinController from './app/controllers/CheckinController';
import HelpOrderController from './app/controllers/HelpOrderController';
import AnswerController from './app/controllers/AnswerController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/sessions', SessionController.store);

routes.post('/students/:id/checkins', CheckinController.store);
routes.get('/students/:id/checkins', CheckinController.show);

routes.post('/students/:id/help-orders', HelpOrderController.store);

routes.use(authMiddleware);

routes.get('/students/:id/help-orders', HelpOrderController.show);

routes.get('/help-orders', AnswerController.index);
routes.post('/help-orders/:id/answer', AnswerController.store);

routes.post('/students', StudentController.store);
routes.put('/students', StudentController.update);

routes.get('/plans', PlanController.index);
routes.post('/plans', PlanController.store);
routes.put('/plans', PlanController.update);
routes.delete('/plans/:id', PlanController.delete);

routes.get('/matriculations', MatriculationController.index);
routes.post('/matriculations', MatriculationController.store);
routes.put('/matriculations/:id', MatriculationController.update);
routes.delete('/matriculations/:id', MatriculationController.delete);

export default routes;
