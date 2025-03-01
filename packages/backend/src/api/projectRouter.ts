import express from 'express';
import {
    ApiCompiledQueryResults,
    ApiExploreResults,
    ApiExploresResults,
    ApiQueryResults,
    ApiStatusResults,
    isExploreError,
    MetricQuery,
} from 'common';
import { isAuthenticated, unauthorisedInDemo } from './authentication';
import { projectService } from '../services/services';
import { SavedQueriesModel } from '../models/savedQueries';

export const projectRouter = express.Router({ mergeParams: true });

projectRouter.get('/', isAuthenticated, async (req, res) => {
    res.json({
        status: 'ok',
        results: await projectService.getProject(
            req.params.projectUuid,
            req.user!,
        ),
    });
});

projectRouter.patch(
    '/',
    isAuthenticated,
    unauthorisedInDemo,
    async (req, res, next) => {
        projectService
            .update(req.params.projectUuid, req.user!, req.body)
            .then((data) => {
                res.json({
                    status: 'ok',
                    results: data,
                });
            })
            .catch(next);
    },
);

projectRouter.get('/explores', isAuthenticated, async (req, res, next) => {
    try {
        const explores = await projectService.getAllExplores(
            req.user!,
            req.params.projectUuid,
        );
        const results: ApiExploresResults = explores.map((explore) =>
            isExploreError(explore)
                ? { name: explore.name, errors: explore.errors }
                : { name: explore.name },
        );
        res.json({
            status: 'ok',
            results,
        });
    } catch (e) {
        next(e);
    }
});

projectRouter.get(
    '/explores/:exploreId',
    isAuthenticated,
    async (req, res, next) => {
        try {
            const results: ApiExploreResults = await projectService.getExplore(
                req.user!,
                req.params.projectUuid,
                req.params.exploreId,
            );
            res.json({ status: 'ok', results });
        } catch (e) {
            next(e);
        }
    },
);

projectRouter.post(
    '/explores/:exploreId/compileQuery',
    isAuthenticated,
    async (req, res, next) => {
        try {
            const { body } = req;
            const metricQuery: MetricQuery = {
                dimensions: body.dimensions,
                metrics: body.metrics,
                filters: body.filters,
                sorts: body.sorts,
                limit: body.limit,
                tableCalculations: body.tableCalculations,
            };
            const results: ApiCompiledQueryResults =
                await projectService.compileQuery(
                    req.user!,
                    metricQuery,
                    req.params.projectUuid,
                    req.params.exploreId,
                );
            res.json({
                status: 'ok',
                results,
            });
        } catch (e) {
            next(e);
        }
    },
);

projectRouter.post(
    '/explores/:exploreId/runQuery',
    isAuthenticated,
    async (req, res, next) => {
        try {
            const { body } = req;
            const metricQuery: MetricQuery = {
                dimensions: body.dimensions,
                metrics: body.metrics,
                filters: body.filters,
                sorts: body.sorts,
                limit: body.limit,
                tableCalculations: body.tableCalculations,
            };
            const results: ApiQueryResults = await projectService.runQuery(
                req.user!,
                metricQuery,
                req.params.projectUuid,
                req.params.exploreId,
            );
            res.json({
                status: 'ok',
                results,
            });
        } catch (e) {
            next(e);
        }
    },
);

projectRouter.post(
    '/refresh',
    isAuthenticated,
    unauthorisedInDemo,
    async (req, res, next) => {
        try {
            // Runs async - error will appear on status endpoint
            projectService
                .refreshAllTables(req.user!, req.params.projectUuid)
                .catch((e) => console.log(`Error running refresh: ${e}`));
            res.json({ status: 'ok' });
        } catch (e) {
            next(e);
        }
    },
);

projectRouter.get('/status', isAuthenticated, async (req, res, next) => {
    try {
        const results: ApiStatusResults = await projectService.getProjectStatus(
            req.params.projectUuid,
            req.user!,
        );
        res.json({
            status: 'ok',
            results,
        });
    } catch (e) {
        next(e);
    }
});

projectRouter.post(
    '/saved',
    isAuthenticated,
    unauthorisedInDemo,
    async (req, res, next) => {
        SavedQueriesModel.create(
            req.user!.userUuid,
            req.params.projectUuid,
            req.body.savedQuery,
        )
            .then((results) => {
                res.json({
                    status: 'ok',
                    results,
                });
            })
            .catch(next);
    },
);

projectRouter.get('/spaces', isAuthenticated, async (req, res, next) => {
    SavedQueriesModel.getAllSpaces(req.params.projectUuid)
        .then((results) => {
            res.json({
                status: 'ok',
                results,
            });
        })
        .catch(next);
});
