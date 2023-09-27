import type { AsyncDataOptions } from '#app'
import type { DirectusClientConfig } from './index'

export interface DirectusItemsOptions<TQuery> extends DirectusClientConfig {
  query?: TQuery | undefined;
}
