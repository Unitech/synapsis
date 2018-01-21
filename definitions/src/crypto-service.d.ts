/**
 * Inspired by https://github.com/Mostafa-Samir/klyng/
 */
declare var crypto: any;
interface Wrapper {
    prime: string;
    publicKey: string;
    computeSecret: Function;
}
declare function secure(msg: any, key: any): {
    payload: any;
    mac: any;
};
declare function verify(msg: any, key: any): any;
declare function diffieHellman(prime: string): Wrapper;
