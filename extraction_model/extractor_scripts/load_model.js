const MODEL_URL = "https://github.com/smn57/frag.extract.a/tree/dev/extraction_model/lstm/tensorflowjs_model/model.json?raw=true";

const model = await tf.loadLayersModel(MODEL_URL);