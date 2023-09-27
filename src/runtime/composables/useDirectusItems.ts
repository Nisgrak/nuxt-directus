import type {
  CollectionType,
  DirectusClientConfig,
  DirectusItemsOptions,
  RegularCollections,
  SingletonCollections,
  Query,
  UnpackList
} from '../types'
import { useAsyncData, computed, toRef, unref } from '#imports'
import { hash } from 'ohash'
import {
  createItem as sdkCreateItem,
  createItems as sdkCreateItems,
  readItem as sdkReadItem,
  readItems as sdkReadItems,
  readSingleton as sdkReadSingleton,
  updateItem as sdkUpdateItem,
  updateItems as sdkUpdateItems,
  updateSingleton as sdkUpdateSingleton,
  deleteItem as sdkDeleteItem,
  deleteItems as sdkDeleteItems
} from '@directus/sdk'

export function useDirectusItems<TSchema extends object> (useStaticToken?: boolean | string) {
  const client = (useStaticToken?: boolean | string) => {
    return useDirectusRest<TSchema>({
      useStaticToken
    })
  }

  async function createItem <
    Collection extends keyof TSchema,
    Item extends Partial<UnpackList<TSchema[Collection]>>,
    TQuery extends Query<TSchema, TSchema[Collection]> | undefined
  > (
    collection: Collection,
    item: Item,
    options?: DirectusItemsOptions<TQuery>
  ) {
    try {
      return await client(options?.useStaticToken || useStaticToken)
        .request(sdkCreateItem(collection, item, options?.query))
    } catch (error: any) {
      if (error && error.message) {
        // eslint-disable-next-line no-console
        console.error("Couldn't create item", error.errors)
      } else {
        // eslint-disable-next-line no-console
      }
    }
  }

  async function createItems <
    Collection extends keyof TSchema,
    Item extends Partial<UnpackList<TSchema[Collection]>>[],
    TQuery extends Query<TSchema, TSchema[Collection]> | undefined
  > (
    collection: Collection,
    items: Item,
    options?: DirectusItemsOptions<TQuery>
  ) {
    try {
      return await client(options?.useStaticToken || useStaticToken)
        .request(sdkCreateItems(collection, items, options?.query))
    } catch (error: any) {
      if (error && error.message) {
        // eslint-disable-next-line no-console
        console.error("Couldn't create items", error.errors)
      } else {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    }
  }

  async function readItem <
    Collection extends RegularCollections<TSchema>,
    TQuery extends Query<TSchema, CollectionType<TSchema, Collection>>
  > (
    collection: Collection,
    id: string | number,
    params?: DirectusItemsOptions<TQuery>
  ) {
    return await client(params?.useStaticToken || useStaticToken)
      .request(sdkReadItem(collection, id, params?.query))
    
  }

  async function readItems <
    Collection extends RegularCollections<TSchema>,
    TQuery extends Query<TSchema, CollectionType<TSchema, Collection>>
  > (
    collection: Collection,
    params?: DirectusItemsOptions<TQuery>
  ) {
    return await client(params?.useStaticToken || useStaticToken)
      .request(sdkReadItems(collection, params?.query))    
  }

  async function readSingleton <
    Collection extends SingletonCollections<TSchema>,
    TQuery extends Query<TSchema, TSchema[Collection]>
  > (
    collection: Collection,
    params?: DirectusItemsOptions<TQuery>
  ) {
    return await client(params?.useStaticToken || useStaticToken)
      .request(sdkReadSingleton(collection, params?.query))
  }

  async function updateItem <
    Collection extends keyof TSchema,
    Item extends Partial<UnpackList<TSchema[Collection]>>,
    TQuery extends Query<TSchema, TSchema[Collection]>
  > (
    collection: Collection,
    id: string | number,
    item: Item,
    options?: DirectusItemsOptions<TQuery>
  ) {
    try {
      return await client(options?.useStaticToken || useStaticToken)
        .request(sdkUpdateItem(collection, id, item, options?.query))
    } catch (error: any) {
      if (error && error.message) {
        // eslint-disable-next-line no-console
        console.error("Couldn't update item", error.errors)
      } else {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    }
  }

  async function updateItems <
    Collection extends keyof TSchema,
    Item extends Partial<UnpackList<TSchema[Collection]>>,
    TQuery extends Query<TSchema, TSchema[Collection]> | undefined
  > (
    collection: Collection,
    ids: string[] | number[],
    item: Item,
    options?: DirectusItemsOptions<TQuery>
  ) {
    try {
      return await client(options?.useStaticToken || useStaticToken)
        .request(sdkUpdateItems(collection, ids, item, options?.query))
    } catch (error: any) {
      if (error && error.message) {
        // eslint-disable-next-line no-console
        console.error("Couldn't update items", error.errors)
      } else {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    }
  }

  async function updateSingleton <
    Collection extends SingletonCollections<TSchema>,
    Item extends Partial<UnpackList<TSchema[Collection]>>,
    TQuery extends Query<TSchema, TSchema[Collection]>
  > (
    collection: Collection,
    item: Item,
    options?: DirectusItemsOptions<TQuery>
  ) {
    try {
      return await client(options?.useStaticToken || useStaticToken)
        .request(sdkUpdateSingleton(collection, item, options?.query))
    } catch (error: any) {
      if (error && error.message) {
        // eslint-disable-next-line no-console
        console.error("Couldn't update singleton", error.errors)
      } else {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    }
  }

  async function deleteItem <
    Collection extends keyof TSchema,
    ID extends string | number
  > (
    collection: Collection,
    id: ID,
    options?: DirectusClientConfig
  ) {
    try {
      return await client(options?.useStaticToken || useStaticToken)
        .request(sdkDeleteItem(collection, id))
    } catch (error: any) {
      if (error && error.message) {
        // eslint-disable-next-line no-console
        console.error("Couldn't delete item", error.errors)
      } else {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    }
  }

  async function deleteItems <
    Collection extends keyof TSchema,
    TQuery extends Query<TSchema, TSchema[Collection]>,
    ID extends string[] | number[]
  > (
    collection: Collection,
    idOrQuery: ID | TQuery,
    options?: DirectusClientConfig
  ) {
    try {
      return await client(options?.useStaticToken || useStaticToken)
        .request(sdkDeleteItems(collection, idOrQuery))
    } catch (error: any) {
      if (error && error.message) {
        // eslint-disable-next-line no-console
        console.error("Couldn't delete items", error.errors)
      } else {
        // eslint-disable-next-line no-console
        console.error(error)
      }
    }
  }

  return {
    createItem,
    createItems,
    readItem,
    readItems,
    readSingleton,
    updateItem,
    updateItems,
    updateSingleton,
    deleteItem,
    deleteItems
  }
}
