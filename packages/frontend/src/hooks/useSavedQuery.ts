import {
    ApiError,
    CreateSavedQuery,
    CreateSavedQueryVersion,
    SavedQuery,
} from 'common';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';
import { lightdashApi } from '../api';
import { useApp } from '../providers/AppProvider';

const createSavedQuery = async (data: CreateSavedQuery) =>
    lightdashApi<SavedQuery>({
        url: `/saved`,
        method: 'POST',
        body: JSON.stringify({ savedQuery: data }),
    });

const getSavedQuery = async (id: string) =>
    lightdashApi<SavedQuery>({
        url: `/saved/${id}`,
        method: 'GET',
        body: undefined,
    });

const addVersionSavedQuery = async ({
    uuid,
    data,
}: {
    uuid: string;
    data: CreateSavedQueryVersion;
}) =>
    lightdashApi<SavedQuery>({
        url: `/saved/${uuid}/version`,
        method: 'POST',
        body: JSON.stringify({ savedQuery: data }),
    });

interface Args {
    id?: string;
}

export const useSavedQuery = ({ id }: Args = {}) =>
    useQuery<SavedQuery, ApiError>({
        queryKey: ['saved_query', id],
        queryFn: () => getSavedQuery(id || ''),
        enabled: id !== undefined,
        retry: false,
    });

export const useCreateMutation = () => {
    const history = useHistory();
    const queryClient = useQueryClient();
    const { showMessage } = useApp();
    return useMutation<SavedQuery, ApiError, CreateSavedQuery>(
        createSavedQuery,
        {
            mutationKey: ['saved_query_create'],
            onSuccess: (data) => {
                queryClient.setQueryData(['saved_query', data.uuid], data);
                showMessage({
                    title: `Query updated with success`,
                });
                history.push({
                    pathname: `/saved/${data.uuid}`,
                });
            },
        },
    );
};

export const useAddVersionMutation = () => {
    const queryClient = useQueryClient();
    const { showMessage } = useApp();
    return useMutation<
        SavedQuery,
        ApiError,
        { uuid: string; data: CreateSavedQueryVersion }
    >(addVersionSavedQuery, {
        mutationKey: ['saved_query_version'],
        onSuccess: (data) => {
            queryClient.setQueryData(['saved_query', data.uuid], data);
            showMessage({
                title: `Query saved with success`,
            });
        },
    });
};
