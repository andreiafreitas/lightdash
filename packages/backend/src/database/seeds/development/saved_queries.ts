import { Knex } from 'knex';
import { DBChartTypes } from 'common';
import { createSavedQuery } from '../../entities/savedQueries';

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('saved_queries').del();

    // Get the project id
    const [{ project_uuid: projectUuid }] = await knex('projects')
        .select('*')
        .limit(1);

    // Inserts seed entries
    await createSavedQuery(projectUuid, {
        name: 'How much revenue do we have per payment method?',
        tableName: 'payments',
        metricQuery: {
            dimensions: ['payments_payment_method'],
            metrics: [
                'payments_total_revenue',
                'payments_unique_payment_count',
            ],
            filters: [],
            sorts: [
                {
                    fieldId: 'payments_total_revenue',
                    descending: false,
                },
            ],
            limit: 10,
            tableCalculations: [],
        },
        chartConfig: {
            chartType: DBChartTypes.COLUMN,
            seriesLayout: {},
        },
        tableConfig: {
            columnOrder: [
                'payments_payment_method',
                'payments_total_revenue',
                'payments_unique_payment_count',
            ],
        },
    });
}
