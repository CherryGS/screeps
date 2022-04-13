declare module NodeJS {
    interface Global {
        Game: Game
        Memory: Memory
        _: _.LoDashStatic
    }
}