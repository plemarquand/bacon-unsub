/*global describe, it */
'use strict';
var expect = require('chai').expect;
var spy = require('sinon').spy;
var baconUnsub = require('../src/');

describe('bacon-unsub', () => {

    beforeEach(function() {
        this.callSpy = spy();
        this.destroySpy = spy();
        this.obj = {
            destroy: this.destroySpy
        };
    });

    afterEach(function() {
        // Get a fresh copy of Bacon for every test.
        delete require.cache[require.resolve('baconjs')];
    });

    describe('Per-subscriber unsubscription', () => {
        beforeEach(function() {
            this.Bacon = baconUnsub(require('baconjs'));
        });

        describe('onValue', () => {
            it('should be augmented with unsubOn', function() {
                expect(this.Bacon.constant('foo').onValue(() => {}).unsubOn).to.not.equal(undefined);
            });

            it('should unsubscribe from the source when the delegate method is called', function(done) {
                this.Bacon.interval(50, 'foo')
                    .onValue(this.callSpy)
                    .unsubOn(this.obj, 'destroy');

                setTimeout(this.obj.destroy, 175);
                setTimeout(() => {
                    expect(this.destroySpy.calledOnce).to.equal(true);
                    expect(this.callSpy.callCount).to.equal(3);
                    done();
                }, 300);
            });

            it('should never have onValue called on a delayed Observable when the delegate method is called immediately', function(done) {
                this.Bacon.later(33, 'foo')
                    .onValue(this.callSpy)
                    .unsubOn(this.obj, 'destroy');

                this.obj.destroy();

                setTimeout(() => {
                    expect(this.destroySpy.calledOnce).to.equal(true);
                    expect(this.callSpy.callCount).to.equal(0);
                    done();
                }, 50);
            });

            it('should create the delegate method if it doesn\'t exist', function(done) {
                this.Bacon.later(33, 'foo')
                    .onValue(this.callSpy)
                    .unsubOn(this.obj, 'nonExistant');

                this.obj.nonExistant();

                setTimeout(() => {
                    expect(this.callSpy.callCount).to.equal(0);
                    done();
                }, 50);
            });

            it('should not interfere with regular unsubscription', function(done) {
                const unsub = this.Bacon.interval(50, 'foo')
                    .onValue(this.callSpy)
                    .unsubOn(this.obj, 'destroy');

                this.Bacon.interval(50, 'bar')
                    .onValue(this.callSpy)
                    .unsubOn(this.obj, 'destroy');

                // Destroy the first immediately
                unsub();

                // Destroy after 2 interations
                setTimeout(this.obj.destroy, 125);

                setTimeout(() => {
                    // expect(this.obj.destroy).to.equal(this.destroySpy);
                    expect(this.callSpy.callCount).to.equal(2);
                    expect(this.callSpy.args[0][0]).to.equal('bar');
                    done();
                }, 175);
            });

            it('should unsubscribe multiple subscriptions to the same delegate method', function(done) {
                this.Bacon.interval(33, 'foo')
                    .onValue(this.callSpy)
                    .unsubOn(this.obj, 'destroy');

                this.Bacon.interval(33, 'bar')
                    .onValue(this.callSpy)
                    .unsubOn(this.obj, 'destroy');

                this.obj.destroy();

                setTimeout(() => {
                    expect(this.destroySpy.calledOnce).to.equal(true);
                    expect(this.callSpy.callCount).to.equal(0);
                    done();
                }, 50);
            });
        });

        describe('onEnd', () => {
            it('should be augmented with unsubOn', function() {
                expect(this.Bacon.constant('foo').onEnd(() => {}).unsubOn).to.not.equal(undefined);
            });

	        it('should unsubscribe from the source when the delegate method is called', function(done) {
                this.Bacon.later(33, 'foo')
                    .onEnd(this.callSpy)
                    .unsubOn(this.obj, 'destroy');

                this.obj.destroy();

                setTimeout(() => {
                    expect(this.destroySpy.calledOnce).to.equal(true);
                    expect(this.callSpy.callCount).to.equal(0);
                    done();
                }, 50);
	        });
        });

        describe('onError', () => {
            it('should be augmented with unsubOn', function() {
                expect(this.Bacon.constant('foo').onError(() => {}).unsubOn).to.not.equal(undefined);
            });

	        it('should unsubscribe from the source when the delegate method is called', function(done) {
                this.Bacon.later(33, new Error())
                    .onError(this.callSpy)
                    .unsubOn(this.obj, 'destroy');

                this.obj.destroy();

                setTimeout(() => {
                    expect(this.destroySpy.calledOnce).to.equal(true);
                    expect(this.callSpy.callCount).to.equal(0);
                    done();
                }, 50);
	        });
        });

        describe('subscribe', () => {
            it('should be augmented with unsubOn', function() {
                expect(this.Bacon.constant('foo').subscribe(() => {}).unsubOn).to.not.equal(undefined);
            });

	        it('should unsubscribe from the source when the delegate method is called', function(done) {
                this.Bacon.later(33, 'foo')
                    .subscribe(this.callSpy)
                    .unsubOn(this.obj, 'destroy');

                this.obj.destroy();

                setTimeout(() => {
                    expect(this.destroySpy.calledOnce).to.equal(true);
                    expect(this.callSpy.callCount).to.equal(0);
                    done();
                }, 50);
	        });
        });
    });

    describe('Global subscriber unsubscription', () => {
        it('should create a generic delegate method', function(done) {
            const Bacon = baconUnsub(require('baconjs'), 'destroy');

            Bacon.interval(50, 'foo')
                .onValue(this.callSpy)
                .unsubOn(this.obj);

            setTimeout(this.obj.destroy, 175);
            setTimeout(() => {
                expect(this.destroySpy.calledOnce).to.equal(true);
                expect(this.callSpy.callCount).to.equal(3);
                done();
            }, 300);
        });
    });
});