# Flux spike
This is a personal spike on a simple message based state management framework, loosely based on the Flux pattern.

It is built in the context of an Angular app and the interesting parts can be found in `src/app/shared/store`

Feel free to comment, steal or just plain ignore it as the unfinished brain-child it is :-)

## Concept
The application state is made up of one or many independent state slices. Each slice is represented by an implementation of a Slice object that defines
the actions that be applied to that state and the reaction (reducing/side effect) of each action. All slices are kept in a Store where they will exist
either throughout the application lifetime or for as long as they are needed depending on the current view. Whenever an Action is dispatch through the Store
it is passed on to all slices giving each slice the oppertunity to change state and start side effects.

## Goal
One of the key goals of this spike is to explore how to make definition of an action and its related logic less verbose and more coherent.

## Disclaimer
This is a spike. Do not expect to see tests or even comments :-)
