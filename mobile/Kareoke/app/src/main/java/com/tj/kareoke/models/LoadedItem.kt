package com.tj.kareoke.models

enum class LoadingState{
    NOT_LOADED,
    LOADING,
    LOADED,
    ERROR;

}

class LoadedItem<T> private constructor(private val loadingState:LoadingState, private val _value: T? ,private val error: Error?){

    companion object        {
        fun<T> unloaded(value:T?=null):LoadedItem<T>{
            return LoadedItem<T>(LoadingState.NOT_LOADED,value,null)
        };
        fun<T> loading(value:T?=null):LoadedItem<T>{
            return LoadedItem<T>(LoadingState.LOADING,value,null)
        };
        fun<T> error(error:Error, value:T?=null):LoadedItem<T>{
            return LoadedItem<T>(LoadingState.ERROR,value,error)
        };
        fun<T> loaded(value:T?) : LoadedItem<T> {
            return LoadedItem<T>(LoadingState.LOADED,value,null)
        }
    }


    fun isUnloaded() : Boolean {
        return loadingState == LoadingState.NOT_LOADED
    }

    fun isLoaded() : Boolean{
        return loadingState == LoadingState.LOADED
    }

    fun isLoading() : Boolean {
        return loadingState == LoadingState.LOADING
    }

    fun isError() : Boolean {
        return loadingState == LoadingState.ERROR
    }
    fun hasValue() : Boolean {
        return _value != null
    }

    val value get() = _value;

    fun getError() : Error? {
        return error
    }

}