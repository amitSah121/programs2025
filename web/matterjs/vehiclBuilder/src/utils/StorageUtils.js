class StorageUtils {
    static saveVehicle() {
        let data = {
            blocks: squareBlocks.map(block => block.serialize()),
            joints: maskingJoints.map(joint => joint.serialize()),
        };
        localStorage.setItem("vehicleData", JSON.stringify(data));
    }

    static loadVehicle() {
        let data = JSON.parse(localStorage.getItem("vehicleData"));
        if (!data) return;

        squareBlocks = data.blocks.map(blockData => SquareBlock.deserialize(blockData));
        maskingJoints = data.joints.map(jointData => Joint.deserialize(jointData));
    }
}
