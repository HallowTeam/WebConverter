// https://api.jquery.com/jQuery.Callbacks/

var _topics = {};

jQuery.Topic = function(id)
{
	var callbacks, method,

	topic = id && _topics[id];

	if (!topic)
	{
		callbacks = jQuery.Callbacks();

		topic =
		{
			publish     : callbacks.fire,
			subscribe   : callbacks.add,
			unsubscribe : callbacks.remove
		};

		if (id)
		{
			_topics[id] = topic;
		}
	}

	return topic;
};
