//@ts-nocheck

const _F32_ = new Float32Array(1);
const _U8_ = new Uint8Array(_F32_.buffer);

// perform addition sanity checks
const VERBOSE = true;

// WRITING PACKETS
const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

export class StreamWriter {
    private _buffer = new ArrayBuffer(0xffff);
    buffer = new Uint8Array(this._buffer);
    ptr = 0;

    bytes() {
        return new Uint8Array(this._buffer, 0, this.ptr).slice();
    }

    reset() {
        this.ptr = 0;
        return this;
    }

    size() {
        return this.ptr;
    }

    writeU8(n: number) {
        if (VERBOSE && (n < 0 || n > 0xff || n !== Math.floor(n))) throw new Error('out of range 0-255 provided:' + n);

        this.buffer[this.ptr++] = n & 0xff;
    }

    writeString(s: string) {
        const l = s.length & 0xff;
        this.buffer[this.ptr++] = l;
        for (let i = 0; i < l; i++) this.buffer[this.ptr++] = s.charCodeAt(i);
    }

    writeUtf16(s: string) {
        const bytes = textEncoder.encode(s);
        const l = bytes.length & 0xff;
        this.buffer[this.ptr++] = l;
        for (let i = 0; i < l; i++) this.buffer[this.ptr++] = bytes[i];
    }

    writeU16(n: number) {
        if (VERBOSE && (n < 0 || n > 0xffff || n !== Math.floor(n))) throw new Error('out of range 0-35565 provided:' + n);
        this.buffer[this.ptr++] = n & 0xff;
        this.buffer[this.ptr++] = (n >> 8) & 0xff;
    }

    writeI32(n: number) {
        if (VERBOSE && (n < 0 || n > 0xffffffff || n !== Math.floor(n))) throw new Error('out of range 0-4294967295 provided:' + n);
        this.buffer[this.ptr++] = n & 0xff;
        this.buffer[this.ptr++] = (n >> 8) & 0xff;
        this.buffer[this.ptr++] = (n >> 16) & 0xff;
        this.buffer[this.ptr++] = (n >> 24) & 0xff;
    }

    writeF32(n: number) {
        _F32_[0] = n;
        this.buffer[this.ptr++] = _U8_[0];
        this.buffer[this.ptr++] = _U8_[1];
        this.buffer[this.ptr++] = _U8_[2];
        this.buffer[this.ptr++] = _U8_[3];
    }

    /*
    Variable length encoding to write a unsigned int
  */
    writeLEB128(n: number) {
        if (VERBOSE && (n < 0 || n !== Math.floor(n))) throw new Error('out of range 0-4294967295 provided:' + n);
        do {
            let byte = n & 0x7f;
            n >>>= 7;
            if (n !== 0) {
                byte |= 0x80;
            }
            this.buffer[this.ptr++] = byte & 0xff;
        } while (n !== 0);
    }
}

// READING PACKETS

export class StreamReader {
    rU8: Uint8Array;
    rPtr = 0;

    readFrom(ab: ArrayBuffer) {
        this.rPtr = 0;
        this.rU8 = new Uint8Array(ab);
    }

    hasMoreData(): boolean {
        return this.rPtr < this.rU8.byteLength;
    }

    showPtr() {
        console.log(this.rU8, this.rPtr);
    }

    readU8(): number {
        return this.rU8[this.rPtr++];
    }

    readU16(): number {
        return this.rU8[this.rPtr++] | (this.rU8[this.rPtr++] << 8);
    }

    readI32(): number {
        return this.rU8[this.rPtr++] | (this.rU8[this.rPtr++] << 8) | (this.rU8[this.rPtr++] << 16) | (this.rU8[this.rPtr++] << 24);
    }

    readF32(): number {
        _U8_[0] = this.rU8[this.rPtr++];
        _U8_[1] = this.rU8[this.rPtr++];
        _U8_[2] = this.rU8[this.rPtr++];
        _U8_[3] = this.rU8[this.rPtr++];
        return _F32_[0];
    }

    readULEB128(): number {
        let result = 0;
        let shift = 0;
        let byte = 0;
        while (true) {
            byte = this.rU8[this.rPtr++];
            result |= (byte & 0x7f) << shift;
            if ((byte & 0x80) == 0) break;
            shift += 7;
        }

        return result;
    }

    readString(): string {
        let result = '';
        const len = this.rU8[this.rPtr++];
        for (let i = 0; i < len; i++) result += String.fromCharCode(this.rU8[this.rPtr++]);
        return result;
    }

    readUtf16(): string {
        const len = this.rU8[this.rPtr++];
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = this.rU8[this.rPtr++];

        return textDecoder.decode(bytes);
    }

    skipPacket() {
        this.rPtr = this.rU8.length;
    }
}
