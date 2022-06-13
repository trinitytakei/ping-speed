# Measuring Network Latency Using the Hotwire Framework

**This is a recipe about measuring network latency to demonstrate the impact of picking a fly.io region.** _I deployed the solution below to various fly.io regions, and the difference was astounding: the latency for the nearest region was almost indistinguishable from the local environment (30-40ms). The same figure for regions far away: 300-400ms. That's a game changer!_

---

Jakob Nielsen published his famous "response times" guideline almost thirty years ago in his groundbreaking book, [Usability Engineering](https://www.nngroup.com/books/usability-engineering/). He makes the following observations about application response time:

> * **less than 100 milliseconds**: users feel that they are directly manipulating objects in the UI
> * **between 200 milliseconds - 1 second**: users notice the delay and thus feel the computer is 'working' on the command
> * **more than 1 second**: [we need to] indicate to the user that the computer is working on the problem

It follows that speeding up application response time by hundreds of milliseconds can make a tangible difference to the end-user.

## Problem

Using the [Single Page Application (SPA)](https://en.wikipedia.org/wiki/Single-page_application) architecture, the only full page-load of the HTML shell happens initially. From that point on, managing and rendering view state occurs on the client - therefore, network latency doesn't affect the user experience.

However, in the case of an application using the [Hotwire framework](https://hotwired.dev/), the views are rendered dynamically on the server. Thus, the total network response time is essential to overall responsiveness. Longer network transfer times mean a less responsive application, impacting the user experience directly.

How can we ensure the best possible network response time for our application?

It all starts with measuring! To paraphrase Peter Drucker, "You can't improve what you don't measure." Let's build a tool that can measure the network latency (the roundtrip network time to get from the client to the server and back to the client):

![Self-serve ping tool demonstration](./self-serve-ping-tool-demo.gif)

When the user clicks the "Start Pinging!" button, the application sends a request to the server every second and displays the roundtrip time in milliseconds.

How could we implement this tool with Hotwire, using the least possible amount of custom Javascript?

## Solution

The first question we should be asking ourselves when implementing a feature with Hotwire is: Which part of the framework should we use? Can we manage with [Turbo](https://turbo.hotwired.dev/) only (if so, do we need [Drive](https://turbo.hotwired.dev/handbook/drive), [Frames](https://turbo.hotwired.dev/handbook/frames), or [Streams](https://turbo.hotwired.dev/handbook/streams)) or do we need to reach after [Stimulus](https://stimulus.hotwired.dev/)?

The answer is provided in the introduction of the [Turbo Handbook](https://turbo.hotwired.dev/handbook/introduction):

> it's not possible to call custom JavaScript functions as part of a Turbo Streams action.
> Turbo focuses squarely on just updating the DOM, and then assumes you'll connect any additional behavior using Stimulus actions and lifecycle callbacks.

In other words, Turbo's goal is to manage standard navigation (clicking links, submitting forms) and REST-style responses. "Update the view every second" is outside the standard request/response cycle - Stimulus to the rescue!

Let's start by creating the view that will also contain the Stimulus sprinkles:

![Rails view implementation](./rails-view-annotated.png)

Here's a rundown of the crucial parts:

1) `data-controller` sets the stage - it tells Stimulus to monitor this section of the DOM tree. The attribute value `ping` means that the code will reside in a Stimulus controller named `ping_controller.js`.
2) `data-action` uses a simple DSL to describe that if the element receives a `click` event, Stimulus will call the `start` function of the `ping` controller.
3) `data-ping-target` annotates elements of interest to the controller (typically input/output placeholders.) In this case, we marked two elements with `startElement` and `resultElement`. We'll se how are we going to use them in a second.

Let's see the implementation of the Stimulus controller.

![Stimulus controller implementation](./stimulus-controller-annotated.png)

1) If the user clicks the *Start Pinging* button, we want to update the button text and disable the element to make it clear that measuring is in progress. We can do this simply and cleanly using the [Stimulus targets API](https://stimulus.hotwired.dev/reference/targets); no need to use custom Javascript to locate the elements. We can reference the element by its target name, `startElement`.
2) We are going to call the `measureAndDisplayPing` method every second.
3) We are making the call to the server, storing the current time before and after the request.
4) We are calculating and displaying the roundtrip time by updating the element annotated with `resultElement`.
5) It's important to clean up after ourselves by calling `clearInverval()`. `disconnect()` is a perfect place to do so, as Stimulus will call this function automatically when the [controller is disconnected](https://stimulus.hotwired.dev/reference/lifecycle-callbacks#disconnection).

And finally, here's the implementation of the `PingController` that we called in step 3 above:

![API Controller Implementation](./ping-api-controller.png)

The controller does the least possible amount of work - responding with `head: ok`. This is intentional: we want to measure the network response time and thus avoid talking to the database or performing any time-consuming action that would add extra time.

## Discussion

We can make our application more reactive using Hotwire, without the need to write custom Javascript most of the time. The above scenario was _not_ one of those cases - to accomplish our task, we had to write Javascript. As we demonstrated above, this is facilitated dramatically by Stimulus. Convention over configuration and the simple but powerful syntax provided by the framework goes a long way to keep our code clean and maintainable.

If we want to use this tool in the wild, we should consider slow connections (where the network latency is more than one second). One possible solution to solve this scenario: we could measure the response time on a couple of requests before starting the measurement and adjust the ping frequency based on that. However, as a proof of concept, this solution is adequate to demonstrate the implementation with Hotwire/Stimulus.
